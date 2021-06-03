import { findByDevice } from 'zigbee-herdsman-converters';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ServiceConfig, ServiceType } from '../types';
import { Capability, Feature, ZigBeeDefinition } from '../zigbee/types';
import { featureToButtonsMapping, getMetaFromFeatures } from './utils';

function serviceFromFeatureName(feature: Feature) {
  const serviceConfig: ServiceConfig = { type: ServiceType.UNKNOWN, meta: {} };
  switch (feature.name) {
    case 'action':
      if (feature.type === 'enum') {
        if (feature.values.includes('vibration')) {
          serviceConfig.type = ServiceType.CONTACT_SENSOR;
          serviceConfig.meta.vibration = true;
        } else {
          // switch
          serviceConfig.type = ServiceType.PROGRAMMABLE_SWITCH;
          serviceConfig.meta.buttonsMapping = featureToButtonsMapping(feature);
        }
      }
      break;
    case 'battery_low':
      serviceConfig.meta.batteryLow = true;
      break;
    case 'presence':
    case 'occupancy':
      serviceConfig.type = ServiceType.MOTION_SENSOR;
      break;
    case 'water_leak':
      serviceConfig.type = ServiceType.LEAK_SENSOR;
      serviceConfig.meta.waterLeak = true;
      break;
    case 'smoke':
      serviceConfig.type = ServiceType.LEAK_SENSOR;
      serviceConfig.meta.smokeLeak = true;
      break;
    case 'battery':
      serviceConfig.type = ServiceType.BATTERY;
      break;
    case 'gas':
      serviceConfig.type = ServiceType.LEAK_SENSOR;
      serviceConfig.meta.gasLeak = true;
      break;
    case 'temperature':
      serviceConfig.type = ServiceType.TEMPERATURE_SENSOR;
      break;
    case 'humidity':
      serviceConfig.type = ServiceType.HUMIDITY_SENSOR;
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
      serviceConfig.type = ServiceType.CONTACT_SENSOR;
      serviceConfig.meta.vibration = true;
      break;
    case 'contact':
      serviceConfig.type = ServiceType.CONTACT_SENSOR;
      serviceConfig.meta.contact = true;
      break;
    case 'tamper':
      serviceConfig.meta.tamper = true;
      break;
    case 'illuminance_lux':
      serviceConfig.type = ServiceType.LIGHT_SENSOR;
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
  const serviceConfig: ServiceConfig = { type: ServiceType.UNKNOWN, meta: {} };
  switch (capability.type) {
    case 'light':
      serviceConfig.type = ServiceType.LIGHT_BULB;
      serviceConfig.meta = getMetaFromFeatures(capability.features);
      break;
    case 'switch':
      serviceConfig.type = /plug|outlet/.test(definition.description.toLowerCase())
        ? ServiceType.OUTLET
        : ServiceType.SWITCH;
      serviceConfig.meta = getMetaFromFeatures(capability.features);
      break;
    case 'lock':
      serviceConfig.type = ServiceType.LOCK;
      serviceConfig.meta = getMetaFromFeatures(capability.features);
      break;
    case 'climate':
      serviceConfig.type = ServiceType.THERMOSTAT;
      serviceConfig.meta = getMetaFromFeatures(capability.features);
      break;
    case 'cover':
      serviceConfig.type = ServiceType.COVER;
      serviceConfig.meta = getMetaFromFeatures(capability.features);
    case 'fan':
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
      .filter(s => s.type !== ServiceType.UNKNOWN); // filter out unknown services
    return services.length ? services : null;
  }
  return null;
}
