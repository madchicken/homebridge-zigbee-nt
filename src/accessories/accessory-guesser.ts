import { Capability, Feature, ZigBeeDefinition } from '../zigbee/types';
import { ServiceConfig, ServiceMeta } from '../types';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ZigBeeAccessoryFactory } from './zig-bee-accessory';
import { ConfigurableAccessory } from './configurable-accessory';
import { findByDevice } from 'zigbee-herdsman-converters';

function getMetaFromFeatures(features: Feature[]) {
  return features.reduce((meta, f) => {
    switch (f.name) {
      case 'color_xy':
        meta.colorXY = true;
        break;
      case 'color_hs':
        meta.hue = true;
        meta.saturation = true;
        break;
      case 'color_temp':
        meta.colorTemp = true;
        break;
      case 'brightness':
        meta.brightness = true;
        break;
    }
    return meta;
  }, {} as ServiceMeta);
}

function serviceFromCapabilityName(capability: Capability) {
  const serviceConfig: ServiceConfig = { type: 'unknown', meta: {} };
  switch (capability.name) {
    case 'battery_low':
      serviceConfig.meta.batteryLow = true;
      break;
    case 'occupancy':
      serviceConfig.type = 'motion-sensor';
      break;
    case 'water_leak':
      serviceConfig.type = 'leak-sensor';
      serviceConfig.meta.waterLeak = true;
      break;
    case 'smoke':
      serviceConfig.type = 'leak-sensor';
      serviceConfig.meta.smokeLeak = true;
      break;
    case 'battery':
      serviceConfig.type = 'battery';
      break;
    case 'gas':
      serviceConfig.type = 'leak-sensor';
      serviceConfig.meta.gasLeak = true;
      break;
    case 'temperature':
      serviceConfig.type = 'temperature-sensor';
      break;
    case 'illuminance_lux':
      serviceConfig.type = 'light-sensor';
      break;
    case 'composite':
      serviceConfig.meta = getMetaFromFeatures(capability.features);
      break;
  }
  return serviceConfig;
}

function getServiceFromCapabilityType(capability: Capability) {
  const serviceConfig: ServiceConfig = { type: 'unknown', meta: {} };
  switch (capability.type) {
    case 'light':
    case 'switch':
      serviceConfig.type = 'bulb';
      serviceConfig.meta = getMetaFromFeatures(capability.features);
  }
  return serviceConfig;
}

const SUPPORTED_TYPES = ['light', 'switch'];

/**
 * Guess the accessory configuration by scanning the device definition and exposed capabilities.
 *
 * @param device the ZigBee Device instance
 * @return ZigBeeAccessoryFactory
 */
export function guessAccessoryFromDevice(device: Device): ZigBeeAccessoryFactory {
  const definition: ZigBeeDefinition = findByDevice(device);
  if (definition) {
    const services: ServiceConfig[] = definition.exposes
      .map(capability =>
        SUPPORTED_TYPES.includes(capability.type)
          ? getServiceFromCapabilityType(capability)
          : serviceFromCapabilityName(capability)
      )
      .filter(s => s.type !== 'unknown'); // filter out unknown services
    if (services.length) {
      return (platform, accessory, client, device) =>
        new ConfigurableAccessory(platform, accessory, client, device, services);
    }
  }
  return null;
}
