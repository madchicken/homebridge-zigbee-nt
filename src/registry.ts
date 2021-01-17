import {
  ZigBeeAccessory,
  ZigBeeAccessoryCtor,
  ZigBeeAccessoryFactory,
} from './accessories/zig-bee-accessory';
import { findByZigbeeModel } from 'zigbee-herdsman-converters';
import { ZigbeeNTHomebridgePlatform } from './platform';
import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from './zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';

const classRegistry: Map<string, ZigBeeAccessoryCtor> = new Map();
const factoryRegistry: Map<string, ZigBeeAccessoryFactory> = new Map();

function getKey(manufacturer: string, model: string) {
  return `${manufacturer}:${model}`;
}

export function clearRegistries() {
  classRegistry.clear();
  factoryRegistry.clear();
}

export function registerAccessoryClass(
  manufacturer: string,
  models: string[],
  clazz: ZigBeeAccessoryCtor
) {
  models.forEach(model => classRegistry.set(getKey(manufacturer, model), clazz));
}

export function registerAccessoryFactory(
  manufacturer: string,
  models: string[],
  factory: ZigBeeAccessoryFactory
) {
  models.forEach(model => factoryRegistry.set(getKey(manufacturer, model), factory));
}

export function createAccessoryInstance<T extends ZigBeeAccessory>(
  manufacturer: string,
  model: string,
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  device: Device
): T {
  let key = getKey(manufacturer, model);
  if (!classRegistry.has(key) && !factoryRegistry.has(key)) {
    const zm = findByZigbeeModel(model);
    if (zm) {
      key = getKey(manufacturer, zm.model);
    }
  }
  const factory = factoryRegistry.get(key);
  if (factory) {
    return factory(platform, accessory, client, device) as T;
  }
  const Clazz = classRegistry.get(key);
  if (Clazz) {
    return new Clazz(platform, accessory, client, device) as T;
  }
  return null;
}
