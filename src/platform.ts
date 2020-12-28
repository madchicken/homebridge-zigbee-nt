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
import * as path from 'path';
import { PermitJoinAccessory } from './accessories/permit-join-accessory';
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
import { HttpServer } from './web/api/http-server';
import { RouterPolling } from './utils/router-polling';

const PERMIT_JOIN_ACCESSORY_NAME = 'zigbee:permit-join';
const TOUCH_LINK_ACCESSORY_NAME = 'zigbee:touchlink';

interface ZigBeeNTPlatformConfig extends PlatformConfig {
  name: string;
  port?: string;
  panId?: number;
  channel?: number;
  secondaryChannel?: string;
  database?: string;
  httpPort?: number;
  disableRoutingPolling?: boolean;
  disableHttpServer?: boolean;
  routerPollingInterval?: number;
}

export class ZigbeeNTHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private readonly accessories: Map<string, PlatformAccessory>;
  private readonly homekitAccessories: Map<string, ZigBeeAccessory>;
  private permitJoinAccessory: PermitJoinAccessory;
  public readonly PlatformAccessory: typeof PlatformAccessory;
  private client: ZigBeeClient;
  private httpServer: HttpServer;
  private routerPolling: RouterPolling;

  constructor(
    public readonly log: Logger,
    public readonly config: ZigBeeNTPlatformConfig,
    public readonly api: API
  ) {
    this.accessories = new Map<string, PlatformAccessory>();
    this.homekitAccessories = new Map<string, ZigBeeAccessory>();
    this.permitJoinAccessory = null;
    this.PlatformAccessory = this.api.platformAccessory;
    this.log.info(`Initializing platform: ${this.config.name}`);
    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => this.startZigBee());
    this.api.on(APIEvent.SHUTDOWN, () => this.stopZigbee());
  }

  get zigBeeClient() {
    return this.client;
  }

  async startZigBee() {
    // Create client
    this.client = new ZigBeeClient(this.log);

    this.zigBeeClient.on('deviceAnnounce', (message: DeviceAnnouncePayload) =>
      this.handleDeviceAnnounce(message)
    );
    this.zigBeeClient.on('deviceInterview', (message: DeviceInterviewPayload) =>
      this.handleZigBeeDevInterview(message)
    );
    this.zigBeeClient.on('deviceJoined', (message: DeviceJoinedPayload) =>
      this.handleZigBeeDevJoined(message)
    );
    this.zigBeeClient.on('deviceLeave', (message: DeviceLeavePayload) =>
      this.handleZigBeeDevLeaving(message)
    );
    this.zigBeeClient.on('message', (message: MessagePayload) => this.handleZigBeeMessage(message));

    await this.client.start({
      channel: this.config.channel,
      secondaryChannel: this.config.secondaryChannel,
      port: this.config.port,
      panId: this.config.panId || 0xffff,
      database: this.config.database || path.join(this.api.user.storagePath(), './zigBee.db'),
    });
    await this.handleZigBeeReady();
  }

  async stopZigbee() {
    try {
      this.log.info('Stopping zigbee service');
      await this.zigBeeClient.stop();
      if (this.routerPolling) {
        this.log.info('Stopping router polling');
        this.routerPolling.stop();
      }
      if (this.httpServer) {
        this.log.info('Stopping http server');
        await this.httpServer.stop();
      }
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
      await this.unpairDevice(ieeeAddr);
    }
  }

  // TODO: I need to move everything into the client
  async handleZigBeeReady() {
    const info: Device = this.zigBeeClient.getCoodinator();
    this.log.info(`ZigBee platform initialized @ ${info.ieeeAddr}`);
    // Set led indicator
    await this.zigBeeClient.toggleLed(!this.config.disableLed);
    // Init permit join accessory
    this.initPermitJoinAccessory();
    // Init switch to reset devices through Touchlink feature
    this.initTouchlinkAccessory();
    // Init devices
    await Promise.all(this.zigBeeClient.getAllPairedDevices().map(data => this.initDevice(data)));

    if (this.config.disableRoutingPolling !== true) {
      this.routerPolling = new RouterPolling(
        this.zigBeeClient,
        this.log,
        this.config.routerPollingInterval
      );
      this.routerPolling.start();
    }

    if (this.config.disableHttpServer !== true) {
      this.httpServer = new HttpServer(this.config.httpPort);
      this.httpServer.start(this);
    }
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
      this.permitJoinAccessory = new PermitJoinAccessory(this, accessory, this.zigBeeClient);
      this.log.info('PermitJoin accessory successfully registered');
    } catch (e) {
      this.log.error('PermitJoin accessory not registered: ', e);
    }
  }

  private initTouchlinkAccessory() {
    try {
      const accessory = this.createHapAccessory(TOUCH_LINK_ACCESSORY_NAME);
      new TouchlinkAccessory(this, accessory, this.zigBeeClient);
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

  private removeAccessory(ieeeAddr: string) {
    const uuid = this.generateUUID(ieeeAddr);
    const accessory = this.accessories.get(uuid);
    if (accessory) {
      this.accessories.delete(uuid);
      this.homekitAccessories.delete(uuid);
    }
  }

  public async unpairDevice(ieeeAddr: string) {
    const result = await this.zigBeeClient.unpairDevice(ieeeAddr);
    if (result) {
      this.log.info('Device has been unpaired:', ieeeAddr);
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        this.getAccessoryByIeeeAddr(ieeeAddr),
      ]);
      this.removeAccessory(ieeeAddr);
    } else {
      this.log.error('Device has NOT been unpaired:', ieeeAddr);
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

  private handleZigBeeMessage(message: MessagePayload) {
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
