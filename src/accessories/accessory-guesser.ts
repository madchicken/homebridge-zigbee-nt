import { findByDevice } from 'zigbee-herdsman-converters';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ServiceConfig } from '../types';
import { Capability, Feature, ZigBeeDefinition } from '../zigbee/types';
import { featureToButtonsMapping, getMetaFromFeatures } from './utils';
import { isEmpty } from 'lodash';

function serviceFromFeatureName(feature: Feature) {
  const serviceConfig: ServiceConfig = { type: 'unknown', meta: {} };
  switch (feature.name) {
    case 'action': {
      const buttonsMapping = featureToButtonsMapping(feature);
      if (!isEmpty(buttonsMapping)) {
        // switch
        serviceConfig.type = 'programmable-switch';
        serviceConfig.meta.buttonsMapping = buttonsMapping;
      }
      break;
    }
    case 'battery_low':
      serviceConfig.meta.batteryLow = true;
      break;
    case 'presence':
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
    case 'humidity':
      serviceConfig.type = 'humidity-sensor';
      break;
    case 'voltage':
      serviceConfig.meta.voltage = true;
      break;
    case 'energy':
      serviceConfig.meta.current = true;
      break;
    case 'power':
      serviceConfig.meta.power = true;
      break;
    case 'vibration':
      serviceConfig.type = 'contact-sensor';
      serviceConfig.meta.vibration = true;
      break;
    case 'contact':
      serviceConfig.type = 'contact-sensor';
      serviceConfig.meta.contact = true;
      break;
    case 'tamper':
      serviceConfig.meta.tamper = true;
      break;
    case 'illuminance_lux':
      serviceConfig.type = 'light-sensor';
      break;
    case 'local_temperature':
      serviceConfig.meta.localTemperature = true;
      break;
    case 'current_heating_setpoint':
    case 'occupied_heating_setpoint':
    case 'occupied_cooling_setpoint':
      serviceConfig.meta.currentHeatingSetpoint = [feature.value_min, feature.value_max];
      break;
    case 'composite':
      serviceConfig.meta = getMetaFromFeatures(feature.features);
      break;
  }
  return serviceConfig;
}

function getServiceFromCapabilityType(capability: Capability, definition: ZigBeeDefinition) {
  const serviceConfig: ServiceConfig = { type: 'unknown', meta: {} };
  switch (capability.type) {
    case 'light':
      serviceConfig.type = 'light-bulb';
      serviceConfig.meta = getMetaFromFeatures(capability.features);
      break;
    case 'switch':
      serviceConfig.type = /plug|outlet/.test(definition.description.toLowerCase())
        ? 'outlet'
        : 'switch';
      serviceConfig.meta = getMetaFromFeatures(capability.features);
      break;
    case 'lock':
      serviceConfig.type = 'lock';
      serviceConfig.meta = getMetaFromFeatures(capability.features);
      break;
    case 'climate':
      serviceConfig.type = 'thermostat';
      serviceConfig.meta = getMetaFromFeatures(capability.features);
      break;
    case 'fan':
    case 'cover':
    case 'text':
      return serviceConfig; // still unsupported
  }
  return serviceConfig;
}

const SUPPORTED_TYPES = ['light', 'switch', 'lock'];

/**
 * Guess the accessory configuration by scanning the device definition and exposed capabilities.
 * Returns a configuration to pass to {@see ConfigurableAccessory} constructor
 *
 * @param device the ZigBee Device instance
 * @return ServiceConfig[] the guessed configuration
 */
export function guessAccessoryFromDevice(device: Device): ServiceConfig[] {
  const definition: ZigBeeDefinition = findByDevice(device);
  if (definition) {
    const services: ServiceConfig[] = definition.exposes
      .map(capability =>
        SUPPORTED_TYPES.includes(capability.type)
          ? getServiceFromCapabilityType(capability, definition)
          : serviceFromFeatureName(capability)
      )
      .filter(s => s.type !== 'unknown'); // filter out unknown services
    return services.length ? services : null;
  }
  return null;
}
