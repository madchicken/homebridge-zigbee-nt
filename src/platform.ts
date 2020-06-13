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
import { ZigBee, ZigBeeDevice } from './zigbee';
import { RouterPolling } from './utils/router-polling';
import * as path from 'path';
import { findSerialPort } from './utils/findSerialPort';
import { PermitJoinAccessory } from './accessories/permit-join-accessory';
import retry from 'async-retry';
import { sleep } from './utils/sleep';
import { parseModel } from './utils/parseModel';
import { ZigBeeAccessoryCtor } from './zig-bee-accessory';
import { getAccessoryClass } from './registry';
import { ZigBeeClient } from './zig-bee-client';
import { TouchlinkAccessory } from './accessories/touchlink-accessory';
import {
  DeviceAnnouncePayload,
  DeviceInterviewPayload,
  DeviceJoinedPayload,
  DeviceLeavePayload,
} from 'zigbee-herdsman/dist/controller/events';

const PERMIT_JOIN_ACCESSORY_NAME = 'zigbee:permit-join';
const TOUCHLINK_ACCESSORY_NAME = 'zigbee:touchlink';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class ZigbeeNTHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private readonly accessories: Map<string, PlatformAccessory>;
  private permitJoinAccessory: PermitJoinAccessory;
  private touchlinkAccessory: TouchlinkAccessory;
  public readonly PlatformAccessory: typeof PlatformAccessory;
  private readonly zigBee: ZigBee;
  private client: ZigBeeClient;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API
  ) {
    this.zigBee = new ZigBee(log);
    this.accessories = new Map();
    this.permitJoinAccessory = null;
    this.PlatformAccessory = this.api.platformAccessory;
    this.log.info(`Initializing platform: ${this.config.name}`);
    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => this.startZigBee());
    this.api.on(APIEvent.SHUTDOWN, () => this.stopZigbee());
  }

  async startZigBee() {
    this.zigBee.init({
      port: this.config.port || (await findSerialPort()),
      db: this.config.database || path.join(this.api.user.storagePath(), './zigBee.db'),
      panId: this.config.panId || 0xffff,
      channel: this.config.channel || 11,
    });

    this.zigBee.on('deviceAnnounce', (message: DeviceAnnouncePayload) => this.handleDeviceAnnounce(message));
    this.zigBee.on('deviceInterview', (message: DeviceInterviewPayload) => this.handleZigBeeDevInterview(message));
    this.zigBee.on('deviceJoined', (message: DeviceJoinedPayload) => this.handleZigBeeDevJoined(message));
    this.zigBee.on('deviceLeave', (message: DeviceLeavePayload) => this.handleZigBeeDevLeaving(message));

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
    await this.zigBee.stop();
    this.log.info('Successfully stopped ZigBee service');
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.set(accessory.UUID, accessory);
  }

  handleZigBeeDevInterview(message: DeviceInterviewPayload) {
    this.log.info(
      `Join progress: interview device ${message.device.ieeeAddr} (${message.device.manufacturerName} - ${message.device.modelID})`
    );
  }

  async handleZigBeeDevJoined(message: DeviceJoinedPayload) {
    const ieeeAddr = message.device.ieeeAddr;
    // Stop permit join
    await this.permitJoinAccessory.setPermitJoin(false);
    this.log.info(`Device announced incoming and is added, id: ${ieeeAddr}`);
    // Ignore if the device exists
    if (!this.getAccessory(ieeeAddr)) {
      // Wait a little bit for a database sync
      await sleep(1500);
      const data = this.zigBee.device(ieeeAddr);
      this.initDevice(data);
    }
  }

  generateUUID(ieeeAddr: string): string {
    return this.api.hap.uuid.generate(ieeeAddr);
  }

  async handleZigBeeDevLeaving(message: DeviceLeavePayload) {
    const ieeeAddr = message.ieeeAddr;
    // Stop permit join
    await this.permitJoinAccessory.setPermitJoin(false);
    this.log.info(`Device announced leaving and will be removed, id: ${ieeeAddr}`);
    const accessory = this.getAccessory(message.ieeeAddr);
    // Sometimes we can unpair device which doesn't exist in HomeKit
    if (accessory) {
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      await this.removeAccessory(ieeeAddr);
    }
  }

  async handleZigBeeReady() {
    const info: ZigBeeDevice = this.zigBee.coordinator();
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
    this.zigBee.list().forEach(data => this.initDevice(data));
    // Init log for router polling service
    if (!this.config.disablePingLog) {
      const routerPolling = new RouterPolling(this.zigBee, this.log, this.config.routerPollingInterval);
      // Some routers need polling to prevent them from sleeping.
      routerPolling.start();
    }
  }

  private getAccessory(ieeeAddr: string) {
    return this.accessories.get(this.generateUUID(ieeeAddr));
  }

  private initDevice(device: ZigBeeDevice) {
    try {
      this.log.info(`Found ZigBee device: `, device);
      const model = parseModel(device.modelID);
      const manufacturer = device.manufacturerName;
      const ieeeAddr = device.ieeeAddr;
      const ZigBeeAccessory: ZigBeeAccessoryCtor = getAccessoryClass(manufacturer, model);

      if (!ZigBeeAccessory) {
        return this.log.info('Unrecognized device:', ieeeAddr, manufacturer, model);
      }

      const accessory = this.createHapAccessory(ieeeAddr);
      new ZigBeeAccessory(this, accessory, this.client, device);
      this.log.info('Registered device:', ieeeAddr, manufacturer, model);
    } catch (error) {
      this.log.info(
        `Unable to initialize device ${device && device.ieeeAddr}, ` +
          'try to remove it and add it again.\n'
      );
      this.log.info('Reason:', error);
    }
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
      const accessory = this.createHapAccessory(TOUCHLINK_ACCESSORY_NAME);
      this.touchlinkAccessory = new TouchlinkAccessory(this, accessory, this.zigBee);
      this.log.info('Touchlink accessory successfully registered');
    } catch (e) {
      this.log.error('Touchlink accessory not registered: ', e);
    }
  }

  private createHapAccessory(name: string) {
    const uuid = this.generateUUID(name);
    const existingAccessory = this.getAccessory(uuid);
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
      await this.zigBee.remove(ieeeAddr);
    }
  }

  private async unpairDevice(device) {
    try {
      this.log.info('Unpairing device:', device.ieeeAddr);
      await this.zigBee.remove(device.ieeeAddr);
    } catch (error) {
      this.log.info('Unable to unpairing properly, trying to unregister device:', device.ieeeAddr);
      await this.zigBee.unregister(device.ieeeAddr);
    } finally {
      this.log.info('Device has been unpaired:', device.ieeeAddr);
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [device.accessory]);
      await this.removeAccessory(device.ieeeAddr);
    }
  }

  private handleDeviceAnnounce(message: DeviceAnnouncePayload) {
    this.log.info(
      `Device announce: ${message.device.ieeeAddr} (${message.device.manufacturerName} - ${message.device.modelID})`
    );
  }
}
