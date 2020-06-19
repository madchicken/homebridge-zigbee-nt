import { Logger, PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from './platform';
import { HerdsmanDefinition, ZigBeeDevice } from './zigbee';
import { JsonPayload, ZigBeeClient } from './zig-bee-client';
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
  protected readonly client: ZigBeeClient;
  protected state: JsonPayload;

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
    this.state = { state: 'OFF' };
    this.accessory = accessory;
    this.accessory.context = device;
    let Characteristic = platform.Characteristic;
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, device.manufacturerName)
      .setCharacteristic(Characteristic.Model, device.modelID)
      .setCharacteristic(Characteristic.SerialNumber, device.ieeeAddr)
      .setCharacteristic(Characteristic.Name, this.herdsmanDefinition.description);
    this.getAvailableServices();
    this.accessory.on('identify', this.handleAccessoryIdentify);
  }

  handleAccessoryIdentify() {}

  public get zigBeeDeviceDescriptor(): ZigBeeDevice {
    return this.accessory.context as ZigBeeDevice;
  }

  public get herdsmanDefinition(): HerdsmanDefinition {
    return findByDevice(this.zigBeeDeviceDescriptor) as HerdsmanDefinition;
  }

  public get name() {
    return this.herdsmanDefinition?.description;
  }

  public abstract getAvailableServices();

  public onDeviceMount() {
    this.zigBeeDeviceDescriptor.updateLastSeen();
    this.zigBeeDeviceDescriptor.save();
  }
}
