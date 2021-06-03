"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurableAccessory = void 0;
const ambient_light_service_builder_1 = require("../builders/ambient-light-service-builder");
const battery_service_builder_1 = require("../builders/battery-service-builder");
const contact_sensor_service_builder_1 = require("../builders/contact-sensor-service-builder");
const humidity_sensor_service_builder_1 = require("../builders/humidity-sensor-service-builder");
const leak_sensor_service_builder_1 = require("../builders/leak-sensor-service-builder");
const lighbulb_service_builder_1 = require("../builders/lighbulb-service-builder");
const lock_service_builder_1 = require("../builders/lock-service-builder");
const motion_sensor_service_builder_1 = require("../builders/motion-sensor-service-builder");
const outlet_service_builder_1 = require("../builders/outlet-service-builder");
const programmable_switch_service_builder_1 = require("../builders/programmable-switch-service-builder");
const switch_service_builder_1 = require("../builders/switch-service-builder");
const temperature_sensor_service_builder_1 = require("../builders/temperature-sensor-service-builder");
const thermostat_service_builder_1 = require("../builders/thermostat-service-builder");
const utils_1 = require("./utils");
const zig_bee_accessory_1 = require("./zig-bee-accessory");
function createLightBulbService(platform, accessory, client, state, serviceConfig) {
    var _a, _b, _c, _d;
    const builder = new lighbulb_service_builder_1.LighbulbServiceBuilder(platform, accessory, client, state).withOnOff();
    if ((_a = serviceConfig.meta) === null || _a === void 0 ? void 0 : _a.colorXY) {
        platform.log.debug(`Light bulb ${platform.getDeviceFriendlyName(accessory.context.ieeeAddr)} supports ColorXY`);
        return builder.withColorXY().build();
    }
    if ((_b = serviceConfig.meta) === null || _b === void 0 ? void 0 : _b.colorHS) {
        platform.log.debug(`Light bulb ${platform.getDeviceFriendlyName(accessory.context.ieeeAddr)} supports ColorHS`);
        return builder.withColorHS().build();
    }
    if ((_c = serviceConfig.meta) === null || _c === void 0 ? void 0 : _c.brightness) {
        builder.withBrightness();
    }
    if ((_d = serviceConfig.meta) === null || _d === void 0 ? void 0 : _d.colorTemp) {
        builder.withColorTemperature();
    }
    return builder.build();
}
function createContactService(platform, accessory, client, state, serviceConfig) {
    var _a, _b;
    const builder = new contact_sensor_service_builder_1.ContactSensorServiceBuilder(platform, accessory, client, state).withContact();
    if ((_a = serviceConfig.meta) === null || _a === void 0 ? void 0 : _a.batteryLow) {
        builder.withBatteryLow();
    }
    if ((_b = serviceConfig.meta) === null || _b === void 0 ? void 0 : _b.tamper) {
        builder.withTamper();
    }
    return builder.build();
}
function createMotionSensorService(platform, accessory, client, state, serviceConfig) {
    var _a, _b;
    const builder = new motion_sensor_service_builder_1.MotionSensorServiceBuilder(platform, accessory, client, state).withOccupancy();
    if ((_a = serviceConfig.meta) === null || _a === void 0 ? void 0 : _a.batteryLow) {
        builder.withBatteryLow();
    }
    if ((_b = serviceConfig.meta) === null || _b === void 0 ? void 0 : _b.tamper) {
        builder.withTamper();
    }
    return builder.build();
}
function createHumiditySensorService(platform, accessory, client, state, serviceConfig) {
    var _a, _b;
    const builder = new humidity_sensor_service_builder_1.HumiditySensorServiceBuilder(platform, accessory, client, state).withHumidity();
    if ((_a = serviceConfig.meta) === null || _a === void 0 ? void 0 : _a.batteryLow) {
        builder.withBatteryLow();
    }
    if ((_b = serviceConfig.meta) === null || _b === void 0 ? void 0 : _b.tamper) {
        builder.withTamper();
    }
    return builder.build();
}
function createTemperatureSensorService(platform, accessory, client, state, serviceConfig) {
    var _a, _b;
    const builder = new temperature_sensor_service_builder_1.TemperatureSensorServiceBuilder(platform, accessory, client, state).withTemperature();
    if ((_a = serviceConfig.meta) === null || _a === void 0 ? void 0 : _a.batteryLow) {
        builder.withBatteryLow();
    }
    if ((_b = serviceConfig.meta) === null || _b === void 0 ? void 0 : _b.tamper) {
        builder.withTamper();
    }
    return builder.build();
}
function createBatteryService(platform, accessory, client, state) {
    return new battery_service_builder_1.BatteryServiceBuilder(platform, accessory, client, state)
        .withBatteryPercentage()
        .build();
}
function createOutletService(platform, accessory, client, state, serviceConfig) {
    var _a, _b, _c;
    const builder = new outlet_service_builder_1.OutletServiceBuilder(platform, accessory, client, state);
    builder.withOnOff();
    if ((_a = serviceConfig.meta) === null || _a === void 0 ? void 0 : _a.power) {
        builder.withPower();
    }
    if ((_b = serviceConfig.meta) === null || _b === void 0 ? void 0 : _b.current) {
        builder.withCurrent();
    }
    if ((_c = serviceConfig.meta) === null || _c === void 0 ? void 0 : _c.voltage) {
        builder.withVoltage();
    }
    return builder.build();
}
function createSwitchService(platform, accessory, client, state, _serviceConfig) {
    const builder = new switch_service_builder_1.SwitchServiceBuilder(platform, accessory, client, state);
    builder.withOnOff();
    return builder.build();
}
function createLeakSensorService(platform, accessory, client, state, serviceConfig) {
    var _a, _b, _c, _d;
    const builder = new leak_sensor_service_builder_1.LeakSensorServiceBuilder(platform, accessory, client, state);
    if ((_a = serviceConfig.meta) === null || _a === void 0 ? void 0 : _a.tamper) {
        builder.withTamper();
    }
    if ((_b = serviceConfig.meta) === null || _b === void 0 ? void 0 : _b.waterLeak) {
        builder.withWaterLeak();
    }
    if ((_c = serviceConfig.meta) === null || _c === void 0 ? void 0 : _c.gasLeak) {
        builder.withGasLeak();
    }
    if ((_d = serviceConfig.meta) === null || _d === void 0 ? void 0 : _d.smokeLeak) {
        builder.withSmokeLeak();
    }
    return builder.build();
}
function createVibrationSensorService(platform, accessory, client, state, serviceConfig) {
    var _a, _b;
    const builder = new contact_sensor_service_builder_1.ContactSensorServiceBuilder(platform, accessory, client, state);
    if ((_a = serviceConfig.meta) === null || _a === void 0 ? void 0 : _a.tamper) {
        builder.withTamper();
    }
    if ((_b = serviceConfig.meta) === null || _b === void 0 ? void 0 : _b.vibration) {
        builder.withVibration();
    }
    return builder.build();
}
function createAmbientLightService(platform, accessory, client, state, _serviceConfig) {
    const builder = new ambient_light_service_builder_1.AmbientLightServiceBuilder(platform, accessory, client, state);
    builder.withAmbientLightLevel();
    return builder.build();
}
function createLockService(platform, accessory, client, state, _serviceConfig) {
    const builder = new lock_service_builder_1.LockServiceBuilder(platform, accessory, client, state);
    return builder.withLockState().build();
}
function createThermostatService(platform, accessory, client, state, serviceConfig) {
    const builder = new thermostat_service_builder_1.ThermostatServiceBuilder(platform, accessory, client, state);
    if (serviceConfig.meta.localTemperature) {
        builder.withCurrentTemperature();
    }
    if (serviceConfig.meta.currentHeatingSetpoint) {
        builder.withTargetTemperature(serviceConfig.meta.currentHeatingSetpoint[0], serviceConfig.meta.currentHeatingSetpoint[1]);
    }
    return builder.build();
}
function createProgrammableSwitchService(platform, accessory, client, state, serviceConfig) {
    const builder = new programmable_switch_service_builder_1.ProgrammableSwitchServiceBuilder(platform, accessory, client, state);
    const buttons = utils_1.buttonsMappingToHomeKitArray(serviceConfig.meta.buttonsMapping);
    Object.entries(buttons).forEach((entry, index) => {
        const [button, events] = entry;
        builder.withStatelessSwitch(button.toUpperCase(), button, index + 1, events); // service index starts from 1
    });
    return builder.build();
}
/**
 * Generic device accessory builder
 */
class ConfigurableAccessory extends zig_bee_accessory_1.ZigBeeAccessory {
    constructor(platform, accessory, client, device, config) {
        super(platform, accessory, client, device);
        this.accessoryConfig = config;
    }
    getAvailableServices() {
        const { platform, accessory, client, state } = this;
        return this.accessoryConfig.reduce((services, serviceConfig) => {
            switch (serviceConfig.type) {
                case 'light-sensor':
                    services.push(createAmbientLightService(platform, accessory, client, this.state, serviceConfig));
                    break;
                case 'contact-sensor':
                    services.push(createContactService(platform, accessory, client, state, serviceConfig));
                    break;
                case 'bulb':
                case 'light-bulb':
                    services.push(createLightBulbService(platform, accessory, client, state, serviceConfig));
                    break;
                case 'switch':
                    services.push(createSwitchService(platform, accessory, client, state, serviceConfig));
                    break;
                case 'motion-sensor':
                    services.push(createMotionSensorService(platform, accessory, client, this.state, serviceConfig));
                    break;
                case 'humidity-sensor':
                    services.push(createHumiditySensorService(platform, accessory, client, state, serviceConfig));
                    break;
                case 'temperature-sensor':
                    services.push(createTemperatureSensorService(platform, accessory, client, state, serviceConfig));
                    break;
                case 'leak-sensor':
                    services.push(createLeakSensorService(platform, accessory, client, state, serviceConfig));
                    break;
                case 'vibration-sensor':
                    services.push(createVibrationSensorService(platform, accessory, client, state, serviceConfig));
                    break;
                case 'outlet':
                    services.push(createOutletService(platform, accessory, client, state, serviceConfig));
                    break;
                case 'lock':
                    services.push(createLockService(platform, accessory, client, state, serviceConfig));
                    break;
                case 'thermostat':
                    services.push(createThermostatService(platform, accessory, client, state, serviceConfig));
                    break;
                case 'battery':
                    services.push(createBatteryService(platform, accessory, client, state));
                    break;
                case 'programmable-switch':
                    services.push(...createProgrammableSwitchService(platform, accessory, client, state, serviceConfig));
                    break;
            }
            return services;
        }, []);
    }
}
exports.ConfigurableAccessory = ConfigurableAccessory;
//# sourceMappingURL=configurable-accessory.js.map