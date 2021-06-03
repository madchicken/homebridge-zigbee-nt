"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAccessorySupported = exports.createAccessoryInstance = exports.registerAccessoryFactory = exports.registerAccessoryClass = exports.clearRegistries = void 0;
const zigbee_herdsman_converters_1 = require("zigbee-herdsman-converters");
const accessory_guesser_1 = require("./accessories/accessory-guesser");
const configurable_accessory_1 = require("./accessories/configurable-accessory");
const parse_model_name_1 = require("./utils/parse-model-name");
const classRegistry = new Map();
const factoryRegistry = new Map();
function getKey(manufacturer, model) {
    return `${manufacturer}:${model}`;
}
function find(device) {
    const model = parse_model_name_1.parseModelName(device.modelID);
    let key = getKey(device.manufacturerName, model);
    if (!classRegistry.has(key) && !factoryRegistry.has(key)) {
        const zm = zigbee_herdsman_converters_1.findByDevice(device);
        if (zm) {
            key = getKey(device.manufacturerName, model);
        }
    }
    return key;
}
// Exported function
function clearRegistries() {
    classRegistry.clear();
    factoryRegistry.clear();
}
exports.clearRegistries = clearRegistries;
/**
 * Register a class to map a given device model (or models) of a manufacturer
 * (or set of manufacturers)
 * @param manufacturer name or names of manufacturers
 * @param models name or names of device models
 * @param clazz the accessory class to register
 */
function registerAccessoryClass(manufacturer, models, clazz) {
    const manufacturers = Array.isArray(manufacturer) ? manufacturer : [manufacturer];
    manufacturers.forEach(manufacturer => {
        models.forEach(model => classRegistry.set(getKey(manufacturer, model), clazz));
    });
}
exports.registerAccessoryClass = registerAccessoryClass;
/**
 * Register a factory to build an accessory for a given device model (or models)
 * of a manufacturer (or set of manufacturers)
 * @param manufacturer name or names of manufacturers
 * @param models name or names of device models
 * @param factory the factory to register
 */
function registerAccessoryFactory(manufacturer, models, factory) {
    const manufacturers = Array.isArray(manufacturer) ? manufacturer : [manufacturer];
    manufacturers.forEach(manufacturer => {
        models.forEach(model => factoryRegistry.set(getKey(manufacturer, model), factory));
    });
}
exports.registerAccessoryFactory = registerAccessoryFactory;
function createAccessoryInstance(platform, accessory, client, device) {
    if (device) {
        const key = find(device);
        if (platform.config.preferAutoDiscover) {
            platform.log.debug('preferAutoDiscover is true: guessing device from zigbee definition');
            const serviceConfigs = accessory_guesser_1.guessAccessoryFromDevice(device);
            if (serviceConfigs) {
                const zbAcc = new configurable_accessory_1.ConfigurableAccessory(platform, accessory, client, device, serviceConfigs);
                const accessoryConfig = zbAcc.accessoryConfig;
                platform.log.debug(`Successfully auto discovered device: ${zbAcc.friendlyName}, ${zbAcc.zigBeeDefinition.description}`, JSON.stringify(accessoryConfig, null, 2));
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
        const serviceConfigs = accessory_guesser_1.guessAccessoryFromDevice(device);
        if (serviceConfigs) {
            const zbAcc = new configurable_accessory_1.ConfigurableAccessory(platform, accessory, client, device, serviceConfigs);
            const accessoryConfig = zbAcc.accessoryConfig;
            platform.log.debug(`Successfully auto discovered device: ${zbAcc.friendlyName}, ${zbAcc.zigBeeDefinition.description}`, JSON.stringify(accessoryConfig, null, 2));
            return zbAcc;
        }
        platform.log.warn(`Device with key ${key} not supported. Please open a Github issue for this at https://github.com/madchicken/homebridge-zigbee-nt/issues`, device);
    }
    else {
        platform.log.error(`Passed device is null, ignoring creation`);
    }
    return null;
}
exports.createAccessoryInstance = createAccessoryInstance;
function isAccessorySupported(device) {
    const key = find(device);
    return factoryRegistry.has(key) || classRegistry.has(key) || zigbee_herdsman_converters_1.findByDevice(device) != null;
}
exports.isAccessorySupported = isAccessorySupported;
//# sourceMappingURL=registry.js.map