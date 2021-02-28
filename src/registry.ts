import { ConfigurableAccessory } from './accessories/configurable-accessory';
import {
  ZigBeeAccessory,
  ZigBeeAccessoryCtor,
  ZigBeeAccessoryFactory,
} from './accessories/zig-bee-accessory';
import { findByDevice } from 'zigbee-herdsman-converters';
import { ZigbeeNTHomebridgePlatform } from './platform';
import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from './zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { parseModelName } from './utils/parse-model-name';
import { guessAccessoryFromDevice } from './accessories/accessory-guesser';

const classRegistry: Map<string, ZigBeeAccessoryCtor> = new Map();
const factoryRegistry: Map<string, ZigBeeAccessoryFactory> = new Map();

function getKey(manufacturer: string, model: string) {
  return `${manufacturer}:${model}`;
}

function find(device: Device) {
  const model = parseModelName(device.modelID);
  let key = getKey(device.manufacturerName, model);
  if (!classRegistry.has(key) && !factoryRegistry.has(key)) {
    const zm = findByDevice(device);
    if (zm) {
      key = getKey(device.manufacturerName, model);
    }
  }
  return key;
}

// Exported function
export function clearRegistries() {
  classRegistry.clear();
  factoryRegistry.clear();
}

export function registerAccessoryClass(
  manufacturer: string | string[],
  models: string[],
  clazz: ZigBeeAccessoryCtor
) {
  const manufacturers = Array.isArray(manufacturer) ? manufacturer : [manufacturer];
  manufacturers.forEach(manufacturer => {
    models.forEach(model => classRegistry.set(getKey(manufacturer, model), clazz));
  });
}

export function registerAccessoryFactory(
  manufacturer: string,
  models: string[],
  factory: ZigBeeAccessoryFactory
) {
  models.forEach(model => factoryRegistry.set(getKey(manufacturer, model), factory));
}

export function createAccessoryInstance<T extends ZigBeeAccessory>(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  device: Device
): T {
  if (device) {
    const key = find(device);
    if (platform.config.preferAutoDiscover) {
      platform.log.debug('preferAutoDiscover is true: guessing device from zigbee definition');
      const autoDiscover = guessAccessoryFromDevice(device);
      if (autoDiscover) {
        const zbAcc: ZigBeeAccessory = autoDiscover(platform, accessory, client, device);
        platform.log.debug(
          `Successfully auto discovered device: ${zbAcc.friendlyName}, ${zbAcc.zigBeeDefinition.description}`,
          (zbAcc as ConfigurableAccessory).accessoryConfig
        );
        return zbAcc as T;
      }
    }
    const factory = factoryRegistry.get(key);
    if (factory) {
      platform.log.debug(`Found factory for device with key ${key}`);
      return factory(platform, accessory, client, device) as T;
    }
    const Clazz = classRegistry.get(key);
    if (Clazz) {
      platform.log.debug(`Found class for device with key ${key}`);
      return new Clazz(platform, accessory, client, device) as T;
    }
    const autoDiscover = guessAccessoryFromDevice(device);
    if (autoDiscover) {
      const zbAcc: ZigBeeAccessory = autoDiscover(platform, accessory, client, device);
      platform.log.debug(
        `Successfully auto discovered device: ${zbAcc.friendlyName}, ${zbAcc.zigBeeDefinition.description}`
      );
      return zbAcc as T;
    }
    platform.log.warn(
      `Device with key ${key} not supported. Please open a Github issue for this at https://github.com/madchicken/homebridge-zigbee-nt/issues`,
      device
    );
  } else {
    platform.log.error(`Passed device is null, ignoring creation`);
  }
  return null;
}

export function isAccessorySupported(device: Device): boolean {
  const key = find(device);
  return factoryRegistry.has(key) || classRegistry.has(key) || findByDevice(device) != null;
}
