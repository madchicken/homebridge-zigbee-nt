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

  get zigBeeClient(): ZigBeeClient {
    return this.client;
  }

  public async startZigBee(): Promise<void> {
    // Create client
    this.client = new ZigBeeClient(this.log, this.config.customDeviceSettings);

    const panId =
      this.config.panId && this.config.panId < 0xffff ? this.config.panId : DEFAULT_PAN_ID;
    const database = this.config.database || path.join(this.api.user.storagePath(), './zigBee.db');
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

  async stopZigbee(): Promise<void> {
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
  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.set(accessory.UUID, accessory);
  }

  async handleZigBeeDevInterview(message: DeviceInterviewPayload): Promise<void> {
    const ieeeAddr = message.device.ieeeAddr;
    const status = message.status;
    switch (status) {
      case 'failed':
        this.log.error(
          `Interview progress ${status} for device ${this.getDeviceFriendlyName(ieeeAddr)}`
        );
        break;
      case 'started':
        this.log.info(
          `Interview progress ${status} for device ${this.getDeviceFriendlyName(ieeeAddr)}`
        );
        break;
      case 'successful':
        this.log.info(
          `Successfully interviewed device: ${message.device.manufacturerName} - ${message.device.modelID}`
        );
        await this.handleDeviceUpdate(message.device);
    }
  }

  async handleZigBeeDevJoined(message: DeviceJoinedPayload): Promise<boolean> {
    this.log.info(
      `Device joined, Adding ${this.getDeviceFriendlyName(message.device.ieeeAddr)} (${
        message.device.manufacturerName
      } - ${message.device.modelID})`
    );
    return await this.handleDeviceUpdate(message.device);
  }

  private async handleDeviceUpdate(device: Device): Promise<boolean> {
    // Ignore if the device exists
    const accessory = this.getHomekitAccessoryByIeeeAddr(device.ieeeAddr);
    if (!accessory) {
      // Wait a little bit for a database sync
      await sleep(1500);
      const uuid = await this.initDevice(device);
      return uuid !== null;
    } else {
      this.log.debug(
        `Not initializing device ${this.getDeviceFriendlyName(
          device.ieeeAddr
        )}: already mapped in Homebridge`
      );
      accessory.internalUpdate({});
    }
    return false;
  }

  generateUUID(ieeeAddr: string): string {
    return this.api.hap.uuid.generate(ieeeAddr);
  }

  async handleZigBeeDevLeaving(message: DeviceLeavePayload): Promise<boolean> {
    const ieeeAddr = message.ieeeAddr;
    // Stop permit join
    await this.permitJoinAccessory.setPermitJoin(false);
    this.log.info(`Device announced leaving and will be removed, id: ${ieeeAddr}`);
    return await this.unpairDevice(ieeeAddr);
  }

  async handleZigBeeReady(): Promise<void> {
    const info: Device = this.zigBeeClient.getCoordinator();
    this.log.info(`ZigBee platform initialized @ ${info.ieeeAddr}`);
    // Set led indicator
    await this.zigBeeClient.toggleLed(!this.config.disableLed);
    // Init permit join accessory
    await this.initPermitJoinAccessory();
    // Init switch to reset devices through Touchlink feature
    this.initTouchLinkAccessory();
    // Init devices
    const paired = (
      await Promise.all(
        this.zigBeeClient.getAllPairedDevices().map(device => this.initDevice(device))
      )
    ).filter(uuid => uuid !== null);

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
    } else {
      this.log.info('WEB UI disabled.');
    }
  }

  public getAccessoryByIeeeAddr(ieeeAddr: string): PlatformAccessory {
    return this.accessories.get(this.generateUUID(ieeeAddr));
  }

  public getAccessoryByUUID(uuid: string): PlatformAccessory {
    return this.accessories.get(uuid);
  }

  public getHomekitAccessoryByIeeeAddr(ieeeAddr: string): ZigBeeAccessory {
    return this.homekitAccessories.get(this.generateUUID(ieeeAddr));
  }

  public getHomekitAccessoryByUUID(uuid: string) {
    return this.homekitAccessories.get(uuid);
  }

  private async initDevice(device: Device): Promise<string> {
    const model = parseModelName(device.modelID);
    const manufacturer = device.manufacturerName;
    const ieeeAddr = device.ieeeAddr;
    this.log.info(
      `Initializing ZigBee device: ${this.getDeviceFriendlyName(
        ieeeAddr
      )} - ${model} - ${manufacturer}`
    );

    if (!isAccessorySupported(device)) {
      this.log.info(
        `Unsupported ZigBee device: ${this.getDeviceFriendlyName(
          ieeeAddr
        )} - ${model} - ${manufacturer}`
      );
      return null;
    } else {
      const accessory = this.createHapAccessory(ieeeAddr);
      const homeKitAccessory = createAccessoryInstance(this, accessory, this.client, device);
      if (homeKitAccessory) {
        this.log.info('Registered device:', homeKitAccessory.friendlyName, manufacturer, model);
        await homeKitAccessory.initialize(); // init services
        this.homekitAccessories.set(accessory.UUID, homeKitAccessory);
        return accessory.UUID;
      }
      return null;
    }
  }

  private async mountDevice(ieeeAddr: string): Promise<void> {
    try {
      const UUID = this.generateUUID(ieeeAddr);
      const zigBeeAccessory = this.getHomekitAccessoryByUUID(UUID);
      if (zigBeeAccessory) {
        return await zigBeeAccessory.onDeviceMount();
      }
    } catch (error) {
      this.log.warn(
        `Unable to initialize device ${this.getDeviceFriendlyName(ieeeAddr)}, ` +
          'try to remove it and add it again.\n'
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
    if (existingAccessory) {
      this.log.info(`Reuse accessory from cache with uuid ${uuid} and name ${name}`);
      return existingAccessory;
    } else {
      const accessory = new this.PlatformAccessory(name, uuid);
      this.log.warn(`Registering new accessory with uuid ${uuid} and name ${name}`);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.accessories.set(uuid, accessory);
      return accessory;
    }
  }

  private removeAccessory(ieeeAddr: string) {
    const uuid = this.generateUUID(ieeeAddr);
    const accessory = this.accessories.get(uuid);
    if (accessory) {
      this.accessories.delete(uuid);
      this.homekitAccessories.delete(uuid);
    }
  }

  public async unpairDevice(ieeeAddr: string): Promise<boolean> {
    const result = await this.zigBeeClient.unpairDevice(ieeeAddr);
    if (result) {
      this.log.info('Device has been unpaired:', ieeeAddr);
      const accessory = this.getAccessoryByIeeeAddr(ieeeAddr);
      if (accessory) {
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.removeAccessory(ieeeAddr);
        return true;
      }
    } else {
      this.log.error('Device has NOT been unpaired:', ieeeAddr);
    }
    return false;
  }

  private async handleDeviceAnnounce(message: DeviceAnnouncePayload): Promise<void> {
    const ieeeAddr = message.device.ieeeAddr;
    this.log.info(
      `Device announce: ${this.getDeviceFriendlyName(ieeeAddr)} (${
        message.device.manufacturerName
      } - ${message.device.modelID})`
    );
    if (message.device.interviewCompleted) {
      let uuid = this.getAccessoryByIeeeAddr(ieeeAddr)?.UUID;
      if (!uuid) {
        // Wait a little bit for a database sync
        await sleep(1500);
        uuid = await this.initDevice(message.device);
        if (!uuid) {
          this.log.warn(`Device not recognized: `, message);
          return;
        }
      }
      return this.getHomekitAccessoryByUUID(uuid).onDeviceMount();
    } else {
      this.log.warn(
        `Not initializing device ${this.getDeviceFriendlyName(
          ieeeAddr
        )}: interview process still not completed`
      );
    }
  }

  private handleZigBeeMessage(message: MessagePayload) {
    this.log.debug(
      `Zigbee message from ${this.getDeviceFriendlyName(message.device.ieeeAddr)}`,
      message
    );
    const zigBeeAccessory = this.getHomekitAccessoryByIeeeAddr(message.device.ieeeAddr);
    if (zigBeeAccessory) {
      this.client.decodeMessage(message, (ieeeAddr: string, state: DeviceState) => {
        this.log.debug(`Decoded state from incoming message`, state);
        zigBeeAccessory.internalUpdate(state);
      }); // if the message is decoded, it will call the statePublisher function
    }
  }

  public getDeviceFriendlyName(ieeeAddr: string): string {
    return (
      this.config.customDeviceSettings?.find(config => config.ieeeAddr === ieeeAddr)
        ?.friendlyName || ieeeAddr
    );
  }

  public isDeviceOnline(ieeeAddr: string): boolean {
    const zigBeeAccessory: ZigBeeAccessory = this.getHomekitAccessoryByIeeeAddr(ieeeAddr);
    if (zigBeeAccessory) {
      return zigBeeAccessory.isOnline;
    }
    return false;
  }
}
