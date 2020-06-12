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

import {PLATFORM_NAME, PLUGIN_NAME} from './settings';
import {ZigBee, ZigBeeDevice} from './zigbee';
import {RouterPolling} from './utils/router-polling';
import * as path from 'path';
import {findSerialPort} from './utils/findSerialPort';
import {get} from 'lodash';
import {PermitJoinAccessory} from './accessories/permit-join-accessory';
import retry from 'async-retry';
import {sleep} from './utils/sleep';
import {parseModel} from './utils/parseModel';
import {ZigBeeAccessory, ZigBeeAccessoryCtor} from './zig-bee-accessory';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import {getAccessoryClass} from "./registry";
import { ZigBeeClient } from './zig-bee-client';

const requireDir = require('require-dir');

const devices: any[] = Object.values(requireDir('./devices'));

const PERMIT_JOIN_ACCESSORY_NAME = 'zigbee:permit-join';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class ZigbeeNTHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private readonly devices: Map<string, ZigBeeAccessory>;
  private readonly accessories: PlatformAccessory[];
  private permitJoinAccessory: PermitJoinAccessory;
  public readonly PlatformAccessory: typeof PlatformAccessory;
  private zigBee: ZigBee;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API
  ) {
    this.zigBee = new ZigBee(log);
    this.devices = new Map();
    this.accessories = [];
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

    this.zigBee.on('deviceAnnounce', (type, message) => this.log.info(`${type}: `, message));
    this.zigBee.on('deviceInterview', (type, message) => this.handleZigBeeDevInterview(message));
    this.zigBee.on('deviceJoined', (type, message) => this.handleZigBeeDevJoined(message));
    this.zigBee.on('deviceLeave', (type, message) => this.handleZigBeeDevLeaving(message));
    this.zigBee.on('message', (type, message) => this.handleEvent(type, message));

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
    this.accessories.push(accessory);
  }

  handleEvent(type: string, data: any) {
    const resolvedEntity = this.zigBee.resolveEntity(data.device || data.ieeeAddr);
    const name =
      resolvedEntity && resolvedEntity.settings ? resolvedEntity.settings.friendlyName : null;

    if (type === 'message') {
      console.log(
        `Received Zigbee message from '${name}', type '${data.type}', cluster '${data.cluster}'` +
        `, data '${JSON.stringify(data.data)}' from endpoint ${data.endpoint.ID}` +
        // eslint-disable-next-line no-prototype-builtins
        (data.hasOwnProperty('groupID') ? ` with groupID ${data.groupID}` : ``)
      );
    } else if (type === 'deviceJoined') {
      console.log(`Device '${name}' joined`);
    } else if (type === 'deviceInterview') {
      if (data.status === 'successful') {
        console.log(`Successfully interviewed '${name}', device has successfully been paired`);

        if (resolvedEntity.definition) {
          const { vendor, description, model } = resolvedEntity.definition;
          console.log(
            `Device '${name}' is supported, identified as: ${vendor} ${description} (${model})`
          );
        } else {
          console.warn(
            `Device '${name}' with Zigbee model '${data.device.modelID}' is NOT supported, ` +
            `please follow https://www.zigbee2mqtt.io/how_tos/how_to_support_new_devices.html`
          );
        }
      } else if (data.status === 'failed') {
        console.error(`Failed to interview '${name}', device has not successfully been paired`);
      } else {
        /* istanbul ignore else */
        if (data.status === 'started') {
          console.log(`Starting interview of '${name}'`);
        }
      }
    } else if (type === 'deviceAnnounce') {
      console.log(`Device '${name}' announced itself`);
    } else {
      /* istanbul ignore else */
      if (type === 'deviceLeave') {
        console.warn(`Device '${name || data.ieeeAddr}' left the network`);
      }
    }

    // Call extensions
    // this.callExtensionMethod('onZigbeeEvent', [type, data, resolvedEntity]);
  }

  handleZigBeeDevInterview(message) {
    const endpoint = get(message, 'status.endpoint.current');
    const endpointTotal = get(message, 'status.endpoint.total');
    const cluster = get(message, 'status.endpoint.cluster.current');
    const clusterTotal = get(message, 'status.endpoint.cluster.total');
    this.log.info(
      `Join progress: interview endpoint ${endpoint} of ${endpointTotal} ` +
        `and cluster ${cluster} of ${clusterTotal}`
    );
  }

  async handleZigBeeDevJoined(message) {
    const ieeeAddr = message.data;
    // Stop permit join
    await this.permitJoinAccessory.setPermitJoin(false);
    this.log.info(`Device announced incoming and is added, id: ${ieeeAddr}`);
    // Ignore if the device exists
    if (!this.getDevice(ieeeAddr)) {
      // Wait a little bit for a database sync
      await sleep(1500);
      const data = this.zigBee.device(ieeeAddr);
      this.initDevice(data);
    }
  }

  async handleZigBeeDevLeaving(message) {
    const ieeeAddr = message.data;
    // Stop permit join
    await this.permitJoinAccessory.setPermitJoin(false);
    this.log.info(`Device announced leaving and will be removed, id: ${ieeeAddr}`);
    const uuid = this.api.hap.uuid.generate(ieeeAddr);
    const accessory = this.getAccessory(uuid);
    // Sometimes we can unpair device which doesn't exist in HomeKit
    if (accessory) {
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.removeDevice(ieeeAddr);
      this.removeAccessory(uuid);
    }
  }

  async handleZigBeeReady() {
    const info: Device = this.zigBee.coordinator();
    this.log.info(`ZigBee platform initialized @ ${info.ieeeAddr}`);
    // Set led indicator
    await this.zigBee.toggleLed(!this.config.disableLed);
    // Init permit join accessory
    this.initPermitJoinAccessory();
    // Init devices
    this.zigBee.list().forEach(data => this.initDevice(data));
    // Init log for router polling service
    if (!this.config.disablePingLog) {
      const routerPolling = new RouterPolling(this.zigBee, this.log, this.config.routerPollingInterval);
      // Some routers need polling to prevent them from sleeping.
      routerPolling.start();
    }
  }

  addDevice(device: ZigBeeAccessory) {
    this.devices.set(device.ieeeAddr, device);
  }

  getDevice(ieeeAddr: string): ZigBeeAccessory {
    return this.devices.get(ieeeAddr);
  }

  getAccessory(uuid: string) {
    return this.accessories.find(a => a.UUID === uuid);
  }

  findAccessory(name: string) {
    const uuid = this.api.hap.uuid.generate(name);
    return this.accessories.find(a => a.UUID === uuid);
  }

  registerAccessory(accessory: PlatformAccessory) {
    this.log.info(`Registering new ZigBee accessory: ${accessory.displayName}`);
    try {
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    } catch (e) {
      this.log.error(`Error while registering accessory ${accessory.displayName}`, e);
    }
  }

  initDevice(data: ZigBeeDevice) {
    try {
      this.log.info(`Found ZigBee device: `, data);
      const client = new ZigBeeClient(this.zigBee, this.log);
      const model = parseModel(data.modelID);
      const manufacturer = data.manufacturerName;
      const ieeeAddr = data.ieeeAddr;
      const ZigBeeAccessory: ZigBeeAccessoryCtor = getAccessoryClass(manufacturer, model);

      if (!ZigBeeAccessory) {
        return this.log.info('Unrecognized device:', ieeeAddr, manufacturer, model);
      }

      const accessory = this.createHapAccessory(ieeeAddr);
      const zigBeeAccessory = new ZigBeeAccessory(this, accessory, client, data);
      this.addDevice(zigBeeAccessory);
      this.log.info('Registered device:', ieeeAddr, manufacturer, model);
    } catch (error) {
      this.log.info(
        `Unable to initialize device ${data && data.ieeeAddr}, ` +
          'try to remove it and add it again.\n'
      );
      this.log.info('Reason:', error);
    }
  }

  initPermitJoinAccessory() {
    try {
      const accessory = this.createHapAccessory(PERMIT_JOIN_ACCESSORY_NAME);
      this.permitJoinAccessory = new PermitJoinAccessory(this, accessory, this.zigBee);
      this.log.info('PermitJoin accessory successfully registered');
    } catch (e) {
      this.log.error('PermitJoin accessory not registered: ', e);
    }
  }

  private createHapAccessory(name: string) {
    const uuid = this.api.hap.uuid.generate(name);
    const existingAccessory = this.getAccessory(uuid);
    const accessory = existingAccessory || new this.PlatformAccessory(name, uuid);
    if (existingAccessory) {
      this.log.info(`Reuse accessory from cache with uuid ${uuid} and name ${name}`);
    } else {
      this.log.info(`Registering new accessory with uuid ${uuid} and name ${name}`);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
    return accessory;
  }

  removeDevice(ieeeAddr) {
    const device = this.devices[ieeeAddr];
    if (device) {
      device.unregister();
      delete this.devices[ieeeAddr];
      this.removeAccessory(this.api.hap.uuid.generate(ieeeAddr));
    }
  }

  removeAccessory(uuid) {
    const index = this.accessories.findIndex(accessory => accessory.UUID === uuid);
    this.accessories.splice(index);
  }

  async unpairDevice(device) {
    try {
      this.log.info('Unpairing device:', device.ieeeAddr);
      await this.zigBee.remove(device.ieeeAddr);
    } catch (error) {
      this.log.info('Unable to unpairing properly, trying to unregister device:', device.ieeeAddr);
      await this.zigBee.unregister(device.ieeeAddr);
    } finally {
      this.log.info('Device has been unpaired:', device.ieeeAddr);
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [device.accessory]);
      this.removeDevice(device.ieeeAddr);
    }
  }
}
