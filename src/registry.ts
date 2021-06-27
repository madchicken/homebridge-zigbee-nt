import { PlatformAccessory } from 'homebridge';
import { findByDevice } from 'zigbee-herdsman-converters';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { guessAccessoryFromDevice } from './accessories/accessory-guesser';
import { ConfigurableAccessory } from './accessories/configurable-accessory';
import {
  ZigBeeAccessory,
  ZigBeeAccessoryCtor,
  ZigBeeAccessoryFactory,
} from './accessories/zig-bee-accessory';
import { ZigbeeNTHomebridgePlatform } from './platform';
import { ServiceConfig } from './types';
import { parseModelName } from './utils/parse-model-name';
import { ZigBeeClient } from './zigbee/zig-bee-client';

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
export function clearRegistries(): void {
  classRegistry.clear();
  factoryRegistry.clear();
}

/**
 * Register a class to map a given device model (or models) of a manufacturer
 * (or set of manufacturers)
 * @param manufacturer name or names of manufacturers
 * @param models name or names of device models
 * @param clazz the accessory class to register
 */
export function registerAccessoryClass(
  manufacturer: string | string[],
  models: string[],
  clazz: ZigBeeAccessoryCtor
): void {
  const manufacturers = Array.isArray(manufacturer) ? manufacturer : [manufacturer];
  manufacturers.forEach(manufacturer => {
    models.forEach(model => classRegistry.set(getKey(manufacturer, model), clazz));
  });
}

/**
 * Register a factory to build an accessory for a given device model (or models)
 * of a manufacturer (or set of manufacturers)
 * @param manufacturer name or names of manufacturers
 * @param models name or names of device models
 * @param factory the factory to register
 */
export function registerAccessoryFactory(
  manufacturer: string | string[],
  models: string[],
  factory: ZigBeeAccessoryFactory
): void {
  const manufacturers = Array.isArray(manufacturer) ? manufacturer : [manufacturer];
  manufacturers.forEach(manufacturer => {
    models.forEach(model => factoryRegistry.set(getKey(manufacturer, model), factory));
  });
}

export function createAccessoryInstance(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  device: Device
): ZigBeeAccessory {
  if (device) {
    const key = find(device);
    if (platform.config.preferAutoDiscover) {
      platform.log.info('preferAutoDiscover is true: guessing device from zigbee definition');
      const serviceConfigs = guessAccessoryFromDevice(device);
      if (serviceConfigs) {
        const zbAcc = new ConfigurableAccessory(
          platform,
          accessory,
          client,
          device,
          serviceConfigs
        );
        const accessoryConfig: ServiceConfig[] = zbAcc.accessoryConfig;
        platform.log.debug(
          `Successfully auto discovered device: ${zbAcc.friendlyName}, ${zbAcc.zigBeeDefinition.description}`,
          JSON.stringify(accessoryConfig, null, 2)
        );
        return zbAcc;
      }
    }
    const factory = factoryRegistry.get(key);
    if (factory) {
      platform.log.debug(`Found factory for device with key ${key}`);
      return factory(platform, accessory, client, device);
    }
    const Clazz = classRegistry.get(key);
    if (Clazz) {
      platform.log.debug(`Found class for device with key ${key}`);
      return new Clazz(platform, accessory, client, device);
    }
    const serviceConfigs = guessAccessoryFromDevice(device);
    if (serviceConfigs) {
      const zbAcc = new ConfigurableAccessory(platform, accessory, client, device, serviceConfigs);
      const accessoryConfig: ServiceConfig[] = zbAcc.accessoryConfig;
      platform.log.debug(
        `Successfully auto discovered device: ${zbAcc.friendlyName}, ${zbAcc.zigBeeDefinition.description}`,
        JSON.stringify(accessoryConfig, null, 2)
      );
      return zbAcc;
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
