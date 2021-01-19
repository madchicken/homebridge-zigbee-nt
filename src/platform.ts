import {
  API,
  APIEvent,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  Service,
} from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import * as path from 'path';
import { PermitJoinAccessory } from './accessories/permit-join-accessory';
import { sleep } from './utils/sleep';
import { parseModelName } from './utils/parse-model-name';
import { ZigBeeAccessory } from './accessories/zig-bee-accessory';
import {
  createAccessoryInstance,
  isAccessorySupported,
  registerAccessoryFactory,
} from './registry';
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
import { DeviceState } from './zigbee/types';
import * as fs from 'fs';
import { ZigBeeNTPlatformConfig } from './types';
import { ConfigurableAccessory } from './accessories/configurable-accessory';
import { difference } from 'lodash';

const PERMIT_JOIN_ACCESSORY_NAME = 'zigbee:permit-join';
const TOUCH_LINK_ACCESSORY_NAME = 'zigbee:touchlink';

const DEFAULT_PAN_ID = 0x1a62;

export class ZigbeeNTHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private readonly accessories: Map<string, PlatformAccessory>;
  private readonly homekitAccessories: Map<string, ZigBeeAccessory>;
  private permitJoinAccessory: PermitJoinAccessory;
  public readonly PlatformAccessory: typeof PlatformAccessory;
  private client: ZigBeeClient;
  private httpServer: HttpServer;
  private touchLinkAccessory: TouchlinkAccessory;

  constructor(
    public readonly log: Logger,
    public readonly config: ZigBeeNTPlatformConfig,
    public readonly api: API
  ) {
    const packageJson = JSON.parse(
      fs.readFileSync(`${path.resolve(__dirname, '../package.json')}`, 'utf-8')
    );
    this.accessories = new Map<string, PlatformAccessory>();
    this.homekitAccessories = new Map<string, ZigBeeAccessory>();
    this.permitJoinAccessory = null;
    this.PlatformAccessory = this.api.platformAccessory;
    this.log.info(
      `Initializing platform: ${this.config.name} - v${packageJson.version} (API v${api.version})`
    );
    if (config.devices) {
      config.devices.forEach(config => {
        this.log.info(
          `Registering custom configured device ${config.manufacturer} - ${config.models.join(
            ', '
          )}`
        );
        registerAccessoryFactory(
          config.manufacturer,
          config.models,
          (
            platform: ZigbeeNTHomebridgePlatform,
            accessory: PlatformAccessory,
            client: ZigBeeClient,
            device: Device
          ) => new ConfigurableAccessory(platform, accessory, client, device, config.services)
        );
      });
    }
    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => this.startZigBee());
    this.api.on(APIEvent.SHUTDOWN, () => this.stopZigbee());
  }

  get zigBeeClient() {
    return this.client;
  }

  async startZigBee() {
    // Create client
    this.client = new ZigBeeClient(this.log);

    const panId =
      this.config.panId && this.config.panId < 0xffff ? this.config.panId : DEFAULT_PAN_ID;
    const database = this.config.database || path.join(this.api.user.storagePath(), './zigBee.db');
    this.backupDatabase(database);
    await this.client.start({
      channel: this.config.channel,
      secondaryChannel: this.config.secondaryChannel,
      port: this.config.port,
      panId,
      database,
      adapter: this.config.adapter,
    });
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

    await this.handleZigBeeReady();
  }

  async stopZigbee() {
    try {
      this.log.info('Stopping zigbee service');
      await this.zigBeeClient?.stop();
      this.log.info('Stopping http server');
      await this.httpServer?.stop();
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
      accessory.internalUpdate({});
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

  async handleZigBeeReady() {
    const info: Device = this.zigBeeClient.getCoodinator();
    this.log.info(`ZigBee platform initialized @ ${info.ieeeAddr}`);
    // Set led indicator
    await this.zigBeeClient.toggleLed(!this.config.disableLed);
    // Init permit join accessory
    await this.initPermitJoinAccessory();
    // Init switch to reset devices through Touchlink feature
    this.initTouchLinkAccessory();
    // Init devices
    const paired = await Promise.all(
      this.zigBeeClient.getAllPairedDevices().map(device => this.initDevice(device))
    );

    paired.push(this.permitJoinAccessory.accessory.UUID);
    paired.push(this.touchLinkAccessory.accessory.UUID);
    const missing = difference([...this.accessories.keys()], paired);
    missing.forEach(uuid => {
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        this.accessories.get(uuid),
      ]);
      this.accessories.delete(uuid);
      this.homekitAccessories.delete(uuid);
    });

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

  private homekitAccessoryExists(ieeeAddr: string): boolean {
    return this.homekitAccessories.has(this.generateUUID(ieeeAddr));
  }

  private initDevice(device: Device): string {
    this.log.info(`Found ZigBee device: `, device);
    const model = parseModelName(device.modelID);
    const manufacturer = device.manufacturerName;
    const ieeeAddr = device.ieeeAddr;

    if (!isAccessorySupported(manufacturer, model)) {
      this.log.info('Unrecognized device:', ieeeAddr, manufacturer, model);
      return null;
    } else {
      const accessory = this.createHapAccessory(ieeeAddr);
      const homeKitAccessory = createAccessoryInstance(
        manufacturer,
        model,
        this,
        accessory,
        this.client,
        device
      );
      this.log.info('Registered device:', ieeeAddr, manufacturer, model);
      homeKitAccessory.initialize(); // init services
      this.homekitAccessories.set(accessory.UUID, homeKitAccessory);
      return accessory.UUID;
    }
  }

  private async mountDevice(ieeeAddr: string): Promise<void> {
    try {
      const UUID = this.generateUUID(ieeeAddr);
      const zigBeeAccessory = this.homekitAccessories.get(UUID);
      if (zigBeeAccessory) {
        return await zigBeeAccessory.onDeviceMount();
      }
    } catch (error) {
      this.log.warn(
        `Unable to initialize device ${ieeeAddr}, ` + 'try to remove it and add it again.\n'
      );
      this.log.warn('Reason:', error);
    }
  }

  private async initPermitJoinAccessory() {
    try {
      const accessory = this.createHapAccessory(PERMIT_JOIN_ACCESSORY_NAME);
      this.permitJoinAccessory = new PermitJoinAccessory(this, accessory, this.zigBeeClient);
      this.log.info('PermitJoin accessory successfully registered');
      if (this.config.enablePermitJoin === true) {
        await this.permitJoinAccessory.setPermitJoin(true);
      }
    } catch (e) {
      this.log.error('PermitJoin accessory not registered: ', e);
    }
  }

  private initTouchLinkAccessory() {
    try {
      const accessory = this.createHapAccessory(TOUCH_LINK_ACCESSORY_NAME);
      this.touchLinkAccessory = new TouchlinkAccessory(this, accessory, this.zigBeeClient);
      this.log.info('TouchLink accessory successfully registered');
    } catch (e) {
      this.log.error('TouchLink accessory not registered: ', e);
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
    if (message.device.interviewCompleted) {
      if (!this.getAccessoryByIeeeAddr(ieeeAddr)) {
        // Wait a little bit for a database sync
        await sleep(1500);
        this.initDevice(message.device);
        await this.mountDevice(ieeeAddr);
      } else {
        this.log.warn(`Not initializing device ${ieeeAddr}: already mapped in Homebridge`);
        await this.homekitAccessories
          .get(this.getAccessoryByIeeeAddr(ieeeAddr).UUID)
          .onDeviceMount();
      }
    } else {
      this.log.warn(`Not initializing device ${ieeeAddr}: interview process still not completed`);
    }
  }

  private handleZigBeeMessage(message: MessagePayload) {
    this.log.debug(`Zigbee message from ${message.device.ieeeAddr}`, message.type);
    if (message.type === 'readResponse') {
      // only process messages that we wait for
      this.client.processQueue(message);
    } else {
      if (this.homekitAccessoryExists(message.device.ieeeAddr)) {
        this.client.decodeMessage(message, (ieeeAddr: string, state: DeviceState) => {
          const zigBeeAccessory = this.getHomekitAccessoryByIeeeAddr(ieeeAddr);
          this.log.debug(`Decoded state from incoming message`, state);
          zigBeeAccessory.internalUpdate(state);
        }); // if the message is decoded, it will call the statePublisher function
      } else {
        this.log.warn(`No device found from message`, message);
      }
    }
  }

  private backupDatabase(database: string) {
    if (fs.existsSync(database)) {
      this.log.debug('Creating copy of existing database');
      fs.copyFileSync(database, `${database}.${Date.now()}`);
    }
  }
}
