import { Logger, PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { findByDevice } from 'zigbee-herdsman-converters';
import { Device, Endpoint } from 'zigbee-herdsman/dist/controller/model';
import { DeviceState, ZigBeeDefinition, ZigBeeEntity } from '../zigbee/types';

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
  private coordinatorEndpoint: Endpoint;

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
    this.coordinatorEndpoint = this.client.getCoodinator().getEndpoint(1);
    let Characteristic = platform.Characteristic;
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

  public get zigBeeDeviceDescriptor(): Device {
    return this.accessory.context as Device;
  }

  public get zigBeeDefinition(): ZigBeeDefinition {
    return findByDevice(this.zigBeeDeviceDescriptor) as ZigBeeDefinition;
  }

  public get name() {
    return this.zigBeeDefinition?.description;
  }

  public abstract getAvailableServices(): Service[];

  public async onDeviceMount() {
    this.zigBeeDeviceDescriptor.updateLastSeen();
    if (this.entity.definition.configure) {
      await this.entity.definition.configure(this.zigBeeDeviceDescriptor, this.coordinatorEndpoint);
    }
  }

  update(device: Device, state: DeviceState) {
    Object.assign(this.accessory.context, { ...device });
    Object.assign(this.state, state);
    this.zigBeeDeviceDescriptor.updateLastSeen();
  }
}
