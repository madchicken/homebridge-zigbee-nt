import assert from 'assert';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { Logger, PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState } from '../zigbee/types';
import { Device } from 'zigbee-herdsman/dist/controller/model';

export abstract class ServiceBuilder {
  protected readonly client: ZigBeeClient;
  protected readonly accessory: PlatformAccessory;
  protected readonly platform: ZigbeeNTHomebridgePlatform;
  protected readonly state: DeviceState;
  protected service: Service;

  protected constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    assert(client !== null, 'ZigBee client must be initialized');
    assert(platform !== null, 'Platform plugin must be initialized');
    assert(accessory !== null, 'Platform Accessory must be initialized');
    this.platform = platform;
    this.accessory = accessory;
    this.client = client;
    this.state = state;
  }

  get device(): Device {
    return this.accessory.context as Device;
  }

  get log(): Logger {
    return this.platform.log;
  }

  public build(): Service {
    return this.service;
  }

  get Characteristic() {
    return this.platform.Characteristic;
  }

  get isOnline() {
    return this.platform.isDeviceOnline(this.device.ieeeAddr);
  }

  get friendlyName() {
    return this.platform.getDeviceFriendlyName(this.device.ieeeAddr);
  }
}
