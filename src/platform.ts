import {
  API,
  APIEvent,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { ZigBee } from './zigbee/zigbee';
import * as path from 'path';
import { findSerialPort } from './utils/find-serial-port';
import { PermitJoinAccessory } from './accessories/permit-join-accessory';
import retry from 'async-retry';
import { sleep } from './utils/sleep';
import { parseModelName } from './utils/parse-model-name';
import { ZigBeeAccessory, ZigBeeAccessoryCtor } from './accessories/zig-bee-accessory';
import { getAccessoryClass } from './registry';
import { ZigBeeClient } from './zigbee/zig-bee-client';
import { TouchlinkAccessory } from './accessories/touchlink-accessory';
import {
  DeviceAnnouncePayload,
  DeviceInterviewPayload,
  DeviceJoinedPayload,
  DeviceLeavePayload,
  MessagePayload,
} from 'zigbee-herdsman/dist/controller/events';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { HttpServer } from './web/http-server';

const PERMIT_JOIN_ACCESSORY_NAME = 'zigbee:permit-join';
const TOUCH_LINK_ACCESSORY_NAME = 'zigbee:touchlink';

interface ZigBeeNTPlatformConfig extends PlatformConfig {
  name: string;
  port?: string;
  panId?: number;
  channel?: number;
  secondaryChannel?: string;
  database?: string;
  routerPollingInterval?: number;
}

export class ZigbeeNTHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private readonly accessories: Map<string, PlatformAccessory>;
  private readonly homekitAccessories: Map<string, ZigBeeAccessory>;
  private permitJoinAccessory: PermitJoinAccessory;
  private touchlinkAccessory: TouchlinkAccessory;
  public readonly PlatformAccessory: typeof PlatformAccessory;
  private readonly zigBee: ZigBee;
  private client: ZigBeeClient;
  private httpServer: HttpServer;

  constructor(
    public readonly log: Logger,
    public readonly config: ZigBeeNTPlatformConfig,
    public readonly api: API
  ) {
    this.zigBee = new ZigBee(log);
    this.accessories = new Map<string, PlatformAccessory>();
    this.homekitAccessories = new Map<string, ZigBeeAccessory>();
    this.permitJoinAccessory = null;
    this.PlatformAccessory = this.api.platformAccessory;
    this.log.info(`Initializing platform: ${this.config.name}`);
    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => this.startZigBee());
    this.api.on(APIEvent.SHUTDOWN, () => this.stopZigbee());
  }

  async startZigBee() {
    const channels = [this.config.channel];
    const secondaryChannel = parseInt(this.config.secondaryChannel);
    if (!isNaN(secondaryChannel) && channels.indexOf(secondaryChannel) === -1) {
      channels.push(secondaryChannel);
    }

    const port = this.config.port || (await findSerialPort());
    this.log.info(`Configured port for ZigBee dongle is ${port}`);
    const initConfig = {
      port,
      db: this.config.database || path.join(this.api.user.storagePath(), './zigBee.db'),
      panId: this.config.panId || 0xffff,
      channels,
    };

    this.log.info(
      `Initializing ZigBee controller on port ${
        initConfig.port
      } and channels ${initConfig.channels.join(', ')}`
    );
    this.zigBee.init(initConfig);

    this.zigBee.on('deviceAnnounce', (message: DeviceAnnouncePayload) =>
      this.handleDeviceAnnounce(message)
    );
    this.zigBee.on('deviceInterview', (message: DeviceInterviewPayload) =>
      this.handleZigBeeDevInterview(message)
    );
    this.zigBee.on('deviceJoined', (message: DeviceJoinedPayload) =>
      this.handleZigBeeDevJoined(message)
    );
    this.zigBee.on('deviceLeave', (message: DeviceLeavePayload) =>
      this.handleZigBeeDevLeaving(message)
    );
    this.zigBee.on('message', (message: MessagePayload) => this.handleZigBeeMessage(message));

    const retrier = async () => {
      try {
        await this.zigBee.start();
        await this.handleZigBeeReady();
        this.log.info('Successfully started ZigBee service');
      } catch (error) {
        this.log.error(error);
        await this.zigBee.stop();
        throw error;
      }
    };

    try {
      await retry(retrier, {
        retries: 20,
        minTimeout: 5000,
        maxTimeout: 5000,
        onRetry: () => this.log.info('Retrying connect to hardware'),
      });
    } catch (error) {
      this.log.info('error:', error);
    }
  }

  async stopZigbee() {
    try {
      await this.zigBee.stop();
      await this.httpServer.stop();
      this.log.info('Successfully stopped ZigBee service');
    } catch (e) {
      this.log.error('Error while stopping ZigBee service', e);
    }
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.set(accessory.UUID, accessory);
  }

  async handleZigBeeDevInterview(message: DeviceInterviewPayload) {
    const ieeeAddr = message.device.ieeeAddr;
    const status = message.status;
    switch (status) {
      case 'failed':
        this.log.error(`Interview progress ${status} for device ${ieeeAddr}`);
        break;
      case 'started':
        this.log.info(`Interview progress ${status} for device ${ieeeAddr}`);
        break;
      case 'successful':
        this.log.info(
          `Successfully interviewed device: ${message.device.manufacturerName} - ${message.device.modelID}`
        );
        await this.handleDeviceUpdate(message.device);
    }
  }

  async handleZigBeeDevJoined(message: DeviceJoinedPayload) {
    this.log.info(
      `Device joined, Adding ${message.device.ieeeAddr} (${message.device.manufacturerName} - ${message.device.modelID})`
    );
    await this.handleDeviceUpdate(message.device);
  }

  private async handleDeviceUpdate(device: Device): Promise<boolean> {
    // Ignore if the device exists
    const accessory = this.getHomekitAccessoryByIeeeAddr(device.ieeeAddr);
    if (!accessory) {
      // Wait a little bit for a database sync
      await sleep(1500);
      await this.initDevice(device);
      return true;
    } else {
      this.log.debug(`Not initializing device ${device.ieeeAddr}: already mapped in Homebridge`);
      accessory.update(device, {});
    }
    return false;
  }

  generateUUID(ieeeAddr: string): string {
    return this.api.hap.uuid.generate(ieeeAddr);
  }

  async handleZigBeeDevLeaving(message: DeviceLeavePayload) {
    const ieeeAddr = message.ieeeAddr;
    // Stop permit join
    await this.permitJoinAccessory.setPermitJoin(false);
    this.log.info(`Device announced leaving and will be removed, id: ${ieeeAddr}`);
    const accessory = this.getAccessoryByIeeeAddr(message.ieeeAddr);
    // Sometimes we can unpair device which doesn't exist in HomeKit
    if (accessory) {
      await this.unpairDevice(accessory.context as Device);
    }
  }

  async handleZigBeeReady() {
    const info: Device = this.zigBee.coordinator();
    this.log.info(`ZigBee platform initialized @ ${info.ieeeAddr}`);
    // Set led indicator
    await this.zigBee.toggleLed(!this.config.disableLed);
    // Init permit join accessory
    this.initPermitJoinAccessory();
    // Init switch to reset devices through Touchlink feature
    this.initTouchlinkAccessory();
    // Create client
    this.client = new ZigBeeClient(this.zigBee, this.log);
    // Init devices
    await Promise.all(this.zigBee.list().map(data => this.initDevice(data)));
    this.httpServer = new HttpServer();
    this.httpServer.start(this.client);
  }

  private getAccessoryByIeeeAddr(ieeeAddr: string) {
    return this.accessories.get(this.generateUUID(ieeeAddr));
  }

  private getAccessoryByUUID(uuid: string) {
    return this.accessories.get(uuid);
  }

  private getHomekitAccessoryByIeeeAddr(ieeeAddr: string): ZigBeeAccessory {
    return this.homekitAccessories.get(this.generateUUID(ieeeAddr));
  }

  private async initDevice(device: Device) {
    try {
      this.log.info(`Found ZigBee device: `, device);
      const model = parseModelName(device.modelID);
      const manufacturer = device.manufacturerName;
      const ieeeAddr = device.ieeeAddr;
      const ZigBeeAccessory: ZigBeeAccessoryCtor = getAccessoryClass(manufacturer, model);

      if (!ZigBeeAccessory) {
        return this.log.info('Unrecognized device:', ieeeAddr, manufacturer, model);
      }

      const accessory = this.createHapAccessory(ieeeAddr);
      const homeKitAccessory = new ZigBeeAccessory(this, accessory, this.client, device);
      this.log.info('Registered device:', ieeeAddr, manufacturer, model);
      this.homekitAccessories.set(accessory.UUID, homeKitAccessory);
      return await homeKitAccessory.onDeviceMount();
    } catch (error) {
      this.log.info(
        `Unable to initialize device ${device && device.ieeeAddr}, ` +
          'try to remove it and add it again.\n'
      );
      this.log.info('Reason:', error);
    }
    return null;
  }

  private initPermitJoinAccessory() {
    try {
      const accessory = this.createHapAccessory(PERMIT_JOIN_ACCESSORY_NAME);
      this.permitJoinAccessory = new PermitJoinAccessory(this, accessory, this.zigBee);
      this.log.info('PermitJoin accessory successfully registered');
    } catch (e) {
      this.log.error('PermitJoin accessory not registered: ', e);
    }
  }

  private initTouchlinkAccessory() {
    try {
      const accessory = this.createHapAccessory(TOUCH_LINK_ACCESSORY_NAME);
      this.touchlinkAccessory = new TouchlinkAccessory(this, accessory, this.zigBee);
      this.log.info('Touchlink accessory successfully registered');
    } catch (e) {
      this.log.error('Touchlink accessory not registered: ', e);
    }
  }

  private createHapAccessory(name: string) {
    const uuid = this.generateUUID(name);
    const existingAccessory = this.getAccessoryByUUID(uuid);
    const accessory = existingAccessory || new this.PlatformAccessory(name, uuid);
    if (existingAccessory) {
      this.log.info(`Reuse accessory from cache with uuid ${uuid} and name ${name}`);
    } else {
      this.log.info(`Registering new accessory with uuid ${uuid} and name ${name}`);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.accessories.set(uuid, accessory);
    }
    return accessory;
  }

  private async removeAccessory(ieeeAddr: string) {
    let uuid = this.generateUUID(ieeeAddr);
    const accessory = this.accessories.get(uuid);
    if (accessory) {
      this.accessories.delete(uuid);
      this.homekitAccessories.delete(uuid);
    }
  }

  private async unpairDevice(device: Device) {
    try {
      this.log.info('Unpairing device:', device.ieeeAddr);
      await this.zigBee.remove(device.ieeeAddr);
    } catch (error) {
      this.log.error(error);
      this.log.info('Unable to unpairing properly, trying to unregister device:', device.ieeeAddr);
      try {
        await this.zigBee.unregister(device.ieeeAddr);
      } catch (e) {
        this.log.error(e);
      }
    } finally {
      this.log.info('Device has been unpaired:', device.ieeeAddr);
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        this.getAccessoryByIeeeAddr(device.ieeeAddr),
      ]);
      await this.removeAccessory(device.ieeeAddr);
    }
  }

  private async handleDeviceAnnounce(message: DeviceAnnouncePayload) {
    const ieeeAddr = message.device.ieeeAddr;
    this.log.info(
      `Device announce: ${ieeeAddr} (${message.device.manufacturerName} - ${message.device.modelID})`
    );
    if (!this.getAccessoryByIeeeAddr(ieeeAddr)) {
      // Wait a little bit for a database sync
      await sleep(1500);
      await this.initDevice(message.device);
    } else {
      this.log.warn(`Not initializing device ${ieeeAddr}: already mapped in Homebridge`);
      await this.homekitAccessories.get(this.getAccessoryByIeeeAddr(ieeeAddr).UUID).onDeviceMount();
    }
  }

  private async handleZigBeeMessage(message: MessagePayload) {
    this.log.debug(`Zigbee message from ${message.device.ieeeAddr}`, message.type);
    if (message.type === 'readResponse') {
      // only process messages that we wait for
      this.client.processQueue(message);
    } else {
      const zigBeeAccessory = this.getHomekitAccessoryByIeeeAddr(message.device.ieeeAddr);
      if (zigBeeAccessory) {
        const state = this.client.decodeMessage(message);
        this.log.debug(`Decoded state from incoming message`, state);
        zigBeeAccessory.update(message.device, state);
      } else {
        this.log.warn(`No device found from message`, message);
      }
    }
  }
}
