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

const MAX_PING_ATTEMPTS = 3;

export abstract class ZigBeeAccessory {
  public readonly ieeeAddr: string;
  protected platform: ZigbeeNTHomebridgePlatform;
  protected log: Logger;
  protected accessory: PlatformAccessory;
  protected readonly client: ZigBeeClient;
  protected state: DeviceState;
  protected readonly entity: ZigBeeEntity;
  private missedPing = 0;
  private isConfiguring = false;
  private interval: number;

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
    return !!this.zigBeeDefinition.meta?.configured;
  }

  private set isConfigured(val: boolean) {
    if (val === true) {
      this.zigBeeDefinition.meta.configured = this.zigBeeDefinition.meta.configureKey;
    } else {
      delete this.zigBeeDefinition.meta.configured;
    }
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
      this.interval = this.platform.config.routerPollingInterval * 1000 || DEFAULT_POLL_INTERVAL;
      if (this.interval < MIN_POLL_INTERVAL || this.interval > MAX_POLL_INTERVAL) {
        this.interval = DEFAULT_POLL_INTERVAL;
      }
      await this.ping();
    } else {
      await this.configureDevice();
    }
  }

  public async ping() {
    try {
      await this.zigBeeDeviceDescriptor.ping();
      await this.configureDevice();
      this.zigBeeDeviceDescriptor.updateLastSeen();
      this.missedPing = 0;
      setTimeout(() => this.ping(), this.interval);
    } catch (e) {
      this.log.warn(`No response from ${this.zigBeeDefinition.description}. Is it online?`);
      this.missedPing++;
      if (this.missedPing > MAX_PING_ATTEMPTS) {
        this.log.error(
          `Device is not responding after ${this.missedPing} ping, sending it offline...`
        );
        this.isConfiguring = false;
        this.isConfigured = false;
        this.zigBeeDeviceDescriptor.save();
      } else {
        setTimeout(() => this.ping(), this.interval);
      }
    }
  }

  public async configureDevice(): Promise<boolean> {
    if (this.shouldConfigure()) {
      this.isConfiguring = true;
      const coordinatorEndpoint = this.client.getCoodinator().getEndpoint(1);
      return await retry<boolean>(
        async (bail: (e: Error) => void, attempt: number) => {
          await this.zigBeeDefinition.configure(this.zigBeeDeviceDescriptor, coordinatorEndpoint);
          this.isConfigured = true;
          this.zigBeeDeviceDescriptor.save();
          this.log.info(`Device ${this.name} successfully configured on attempt ${attempt}!`);
          return true;
        },
        {
          retries: MAX_PING_ATTEMPTS,
          onRetry: (e: Error, attempt: number) => {
            if (attempt === MAX_PING_ATTEMPTS) {
              this.isConfiguring = false;
              this.isConfigured = false;
              this.zigBeeDeviceDescriptor.save();
            }
          },
        }
      );
    }
    return false;
  }

  private shouldConfigure() {
    return (
      !!this.zigBeeDefinition.configure && // it must have the configure function defined
      !this.isConfigured &&
      !this.zigBeeDefinition.interviewing &&
      !this.isConfiguring
    );
  }

  update(state: DeviceState) {
    this.log.debug(`Updating state of device ${this.name}: `, state);
    this.state = { ...this.state, ...state };
    this.zigBeeDeviceDescriptor.updateLastSeen();
    this.configureDevice().then(configured =>
      configured ? this.log.debug(`${this.name} configured after state update`) : null
    );
  }

  supports(property: string): boolean {
    return (
      this.entity.definition.exposes?.find(capability => capability.name === property) !== null
    );
  }
}
