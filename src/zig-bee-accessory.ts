import { Logger, PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from './platform';
import Timeout = NodeJS.Timeout;
import { HerdsmanDefinition, ZigBeeDevice } from './zigbee';
import { ZigBeeClient } from './zig-bee-client';
import { findByDevice } from 'zigbee-herdsman-converters';

export interface ZigBeeAccessoryCtor {
  new (
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    data: ZigBeeDevice
  ): ZigBeeAccessory;
}

export abstract class ZigBeeAccessory {
  public readonly ieeeAddr: string;
  protected platform: ZigbeeNTHomebridgePlatform;
  protected log: Logger;
  protected accessory: PlatformAccessory;
  private readonly timeouts: { [key: string]: Timeout };
  protected readonly client: ZigBeeClient;

  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: ZigBeeDevice
  ) {
    this.client = client;
    this.ieeeAddr = device.ieeeAddr;
    this.platform = platform;
    this.log = this.platform.log;
    this.timeouts = {};
    this.accessory = accessory;
    this.accessory.context = device;
    let Characteristic = platform.Characteristic;
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, device.manufacturerName)
      .setCharacteristic(Characteristic.Model, device.modelID)
      .setCharacteristic(Characteristic.SerialNumber, device.ieeeAddr)
      .setCharacteristic(Characteristic.Name, this.getHerdsmanDefinition().description);
    this.getAvailableServices();
    this.accessory.on('identify', this.handleAccessoryIdentify);
  }

  handleAccessoryIdentify() {}

  public getZigBeeDeviceDescriptor(): ZigBeeDevice {
    return this.accessory.context as ZigBeeDevice;
  }

  public getHerdsmanDefinition(): HerdsmanDefinition {
    return findByDevice(this.getZigBeeDeviceDescriptor()) as HerdsmanDefinition;
  }

  public get name() {
    return this.getHerdsmanDefinition()?.description;
  }

  public abstract getAvailableServices();

  public onDeviceMount() {}
}
