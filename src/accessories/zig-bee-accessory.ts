import { Logger, PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { findByDevice } from 'zigbee-herdsman-converters';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { DeviceState, ZigBeeDefinition, ZigBeeEntity } from '../zigbee/types';
import {
  DEFAULT_POLL_INTERVAL,
  isDeviceRouter,
  MAX_POLL_INTERVAL,
  MIN_POLL_INTERVAL,
} from '../utils/router-polling';
import retry from 'async-retry';

export interface ZigBeeAccessoryCtor {
  new (
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    data: Device
  ): ZigBeeAccessory;
}

export abstract class ZigBeeAccessory {
  public readonly ieeeAddr: string;
  protected platform: ZigbeeNTHomebridgePlatform;
  protected log: Logger;
  protected accessory: PlatformAccessory;
  protected readonly client: ZigBeeClient;
  protected state: DeviceState;
  protected readonly entity: ZigBeeEntity;

  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device
  ) {
    this.client = client;
    this.ieeeAddr = device.ieeeAddr;
    this.platform = platform;
    this.log = this.platform.log;
    this.state = { state: 'OFF' };
    this.accessory = accessory;
    this.accessory.context = device;
    this.entity = this.client.resolveEntity(device);
    const Characteristic = platform.Characteristic;
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, device.manufacturerName)
      .setCharacteristic(Characteristic.Model, device.modelID)
      .setCharacteristic(Characteristic.SerialNumber, device.ieeeAddr)
      .setCharacteristic(Characteristic.Name, this.zigBeeDefinition.description);
    this.getAvailableServices();
    this.accessory.on('identify', () => this.handleAccessoryIdentify());
  }

  handleAccessoryIdentify() {}

  private get isConfigured() {
    return this.zigBeeDefinition.meta.configured === true;
  }

  private set isConfigured(val: boolean) {
    this.zigBeeDefinition.meta.configured = val;
  }

  public get zigBeeDeviceDescriptor(): Device {
    return this.accessory.context as Device;
  }

  public get zigBeeDefinition(): ZigBeeDefinition {
    return this.entity
      ? this.entity.definition
      : (findByDevice(this.zigBeeDeviceDescriptor) as ZigBeeDefinition);
  }

  public get name() {
    return this.zigBeeDefinition?.description;
  }

  public abstract getAvailableServices(): Service[];

  public async onDeviceMount() {
    this.log.info(`Mounting device ${this.name}...`);
    if (
      isDeviceRouter(this.zigBeeDeviceDescriptor) &&
      this.platform.config.disableRoutingPolling !== true
    ) {
      this.log.info(`Device ${this.name} is a router, install ping`);
      let interval = this.platform.config.routerPollingInterval * 1000 || DEFAULT_POLL_INTERVAL;
      if (interval < MIN_POLL_INTERVAL || interval > MAX_POLL_INTERVAL) {
        interval = DEFAULT_POLL_INTERVAL;
      }
      await this.ping();
      setInterval(() => {
        this.ping();
      }, interval);
    } else {
      await this.configureDevice();
    }
  }

  public async ping() {
    try {
      await this.zigBeeDeviceDescriptor.ping();
      await this.configureDevice();
      this.zigBeeDeviceDescriptor.updateLastSeen();
    } catch (e) {
      this.log.warn(`No response from ${this.zigBeeDefinition.description}. Is it online?`);
    }
  }

  public async configureDevice() {
    if (
      this.zigBeeDefinition.configure &&
      !this.isConfigured &&
      !this.zigBeeDefinition.interviewing
    ) {
      const coordinatorEndpoint = this.client.getCoodinator().getEndpoint(1);
      this.isConfigured = await retry<boolean>(
        async () => {
          await this.zigBeeDefinition.configure(this.zigBeeDeviceDescriptor, coordinatorEndpoint);
          this.zigBeeDeviceDescriptor.updateLastSeen();
          this.zigBeeDeviceDescriptor.save();
          this.log.info(`Device ${this.name} successfully configured!`);
          return true;
        },
        { retries: 3 }
      );
    }
  }

  update(device: Device, state: DeviceState) {
    this.log.debug(`Updating state of device ${this.name}: `, state);
    Object.assign(this.accessory.context, { ...device });
    Object.assign(this.state, state);
    this.zigBeeDeviceDescriptor.updateLastSeen();
    this.configureDevice().then(() => this.log.info(`${this.name} configured`));
  }

  supports(property: string) {
    return this.entity.definition.supports?.includes(property);
  }
}
