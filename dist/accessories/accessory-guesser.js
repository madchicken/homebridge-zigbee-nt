"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guessAccessoryFromDevice = void 0;
const zigbee_herdsman_converters_1 = require("zigbee-herdsman-converters");
const types_1 = require("../types");
const utils_1 = require("./utils");
function serviceFromFeatureName(feature) {
    const serviceConfig = { type: types_1.ServiceType.UNKNOWN, meta: {} };
    switch (feature.name) {
        case 'action':
            if (feature.type === 'enum') {
                if (feature.values.includes('vibration')) {
                    serviceConfig.type = types_1.ServiceType.CONTACT_SENSOR;
                    serviceConfig.meta.vibration = true;
                }
                else {
                    // switch
                    serviceConfig.type = types_1.ServiceType.PROGRAMMABLE_SWITCH;
                    serviceConfig.meta.buttonsMapping = utils_1.featureToButtonsMapping(feature);
                }
            }
            break;
        case 'battery_low':
            serviceConfig.meta.batteryLow = true;
            break;
        case 'presence':
        case 'occupancy':
            serviceConfig.type = types_1.ServiceType.MOTION_SENSOR;
            break;
        case 'water_leak':
            serviceConfig.type = types_1.ServiceType.LEAK_SENSOR;
            serviceConfig.meta.waterLeak = true;
            break;
        case 'smoke':
            serviceConfig.type = types_1.ServiceType.LEAK_SENSOR;
            serviceConfig.meta.smokeLeak = true;
            break;
        case 'battery':
            serviceConfig.type = types_1.ServiceType.BATTERY;
            break;
        case 'gas':
            serviceConfig.type = types_1.ServiceType.LEAK_SENSOR;
            serviceConfig.meta.gasLeak = true;
            break;
        case 'temperature':
            serviceConfig.type = types_1.ServiceType.TEMPERATURE_SENSOR;
            break;
        case 'humidity':
            serviceConfig.type = types_1.ServiceType.HUMIDITY_SENSOR;
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
            serviceConfig.type = types_1.ServiceType.CONTACT_SENSOR;
            serviceConfig.meta.vibration = true;
            break;
        case 'contact':
            serviceConfig.type = types_1.ServiceType.CONTACT_SENSOR;
            serviceConfig.meta.contact = true;
            break;
        case 'tamper':
            serviceConfig.meta.tamper = true;
            break;
        case 'illuminance_lux':
            serviceConfig.type = types_1.ServiceType.LIGHT_SENSOR;
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
            serviceConfig.meta = utils_1.getMetaFromFeatures(feature.features);
            break;
    }
    return serviceConfig;
}
function getServiceFromCapabilityType(capability, definition) {
    const serviceConfig = { type: types_1.ServiceType.UNKNOWN, meta: {} };
    switch (capability.type) {
        case 'light':
            serviceConfig.type = types_1.ServiceType.LIGHT_BULB;
            serviceConfig.meta = utils_1.getMetaFromFeatures(capability.features);
            break;
        case 'switch':
            serviceConfig.type = /plug|outlet/.test(definition.description.toLowerCase())
                ? types_1.ServiceType.OUTLET
                : types_1.ServiceType.SWITCH;
            serviceConfig.meta = utils_1.getMetaFromFeatures(capability.features);
            break;
        case 'lock':
            serviceConfig.type = types_1.ServiceType.LOCK;
            serviceConfig.meta = utils_1.getMetaFromFeatures(capability.features);
            break;
        case 'climate':
            serviceConfig.type = types_1.ServiceType.THERMOSTAT;
            serviceConfig.meta = utils_1.getMetaFromFeatures(capability.features);
            break;
        case 'cover':
            serviceConfig.type = types_1.ServiceType.COVER;
            serviceConfig.meta = utils_1.getMetaFromFeatures(capability.features);
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
function guessAccessoryFromDevice(device) {
    const definition = zigbee_herdsman_converters_1.findByDevice(device);
    if (definition) {
        const services = definition.exposes
            .map(capability => SUPPORTED_TYPES.includes(capability.type)
            ? getServiceFromCapabilityType(capability, definition)
            : serviceFromFeatureName(capability))
            .filter(s => s.type !== types_1.ServiceType.UNKNOWN); // filter out unknown services
        return services.length ? services : null;
    }
    return null;
}
exports.guessAccessoryFromDevice = guessAccessoryFromDevice;
//# sourceMappingURL=accessory-guesser.js.map