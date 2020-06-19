import { JsonPayload, ZigBeeClient } from '../zig-bee-client';
import { Logger, PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ZigBeeDevice } from '../zigbee';

export abstract class ServiceBuilder {
  protected readonly client: ZigBeeClient;
  protected readonly accessory: PlatformAccessory;
  protected readonly platform: ZigbeeNTHomebridgePlatform;
  protected readonly state: JsonPayload;
  protected service: Service;

  protected constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: JsonPayload
  ) {
    this.platform = platform;
    this.accessory = accessory;
    this.client = client;
    this.state = state;
  }

  get device(): ZigBeeDevice {
    return this.accessory.context as ZigBeeDevice;
  }

  get log(): Logger {
    return this.platform.log;
  }

  public build(): Service {
    return this.service;
  }
}
