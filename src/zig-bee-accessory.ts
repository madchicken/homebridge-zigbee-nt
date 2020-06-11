import { Logger, PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from './platform';
import Timeout = NodeJS.Timeout;
import {ZigBeeDevice} from "./zigbee";
import { ZigBeeClient } from './zig-bee-client';

const nanoid = require('nanoid');

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
    data: ZigBeeDevice
  ) {
    this.client = client;
    this.ieeeAddr = data.ieeeAddr;
    this.platform = platform;
    this.log = this.platform.log;
    this.timeouts = {};
    this.accessory = accessory;
    this.accessory.context = data;
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)
      .setCharacteristic(this.platform.Characteristic.Manufacturer, data.manufacturerName)
      .setCharacteristic(this.platform.Characteristic.Model, data.modelID)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, data.ieeeAddr);
    this.getAvailableServices();
    this.accessory.on('identify', this.handleAccessoryIdentify);
  }

  handleAccessoryIdentify() {}

  abstract get name(): string;

  addCharacteristicIfDoesNotExist(service, characteristic, optional = false) {
    const target = this.parseCharacteristic(characteristic);
    if (!service.testCharacteristic(target)) {
      if (optional) {
        service.addOptionalCharacteristic(target);
      } else {
        service.addCharacteristic(target);
      }
    }
  }

  parseServiceType(service) {
    if (typeof service === 'function') {
      return service;
    }
    return this.accessory.getService(service);
  }

  parseServiceName(name) {
    if (typeof name === 'function') {
      return name;
    }
    return `${this.name} ${name}`;
  }

  parseCharacteristic(characteristic) {
    if (typeof characteristic === 'function') {
      return characteristic;
    }
    return this.platform.Characteristic[characteristic];
  }

  createService(name, type, subtype) {
    return this.parseServiceType(type);
  }

  getService(service) {
    return this.accessory.getService(this.parseServiceName(service));
  }

  getServiceCharacteristic(service, characteristic) {
    return this.getService(service).getCharacteristic(this.parseCharacteristic(characteristic));
  }

  setTimeout(callback, timeout) {
    const timeoutId = nanoid();
    this.timeouts[timeoutId] = setTimeout(callback, timeout);
    return timeoutId;
  }

  clearTimeout(timeoutId) {
    clearTimeout(this.timeouts[timeoutId]);
    delete this.timeouts[timeoutId];
  }

  clearTimeouts() {
    for (const timeoutId of Object.keys(this.timeouts)) {
      this.clearTimeout(timeoutId);
    }
  }

  abstract getAvailableServices();

  unregister() {
    this.clearTimeouts();
  }
}
