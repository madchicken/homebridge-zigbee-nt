"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemperatureFixer = exports.MAX_TEMP = exports.MIN_TEMP = exports.ThermostatServiceBuilder = exports.translateTargetStateToSystemMode = exports.translateTargetStateFromSystemMode = exports.translateCurrentStateFromSystemMode = exports.runningStateToCurrentHeatingCoolingState = void 0;
const index_1 = require("../index");
const service_builder_1 = require("./service-builder");
function runningStateToCurrentHeatingCoolingState(val) {
    switch (val) {
        case 'heat':
            return index_1.HAP.Characteristic.CurrentHeatingCoolingState.HEAT;
        case 'cool':
            return index_1.HAP.Characteristic.CurrentHeatingCoolingState.COOL;
        case 'idle':
        default:
            return index_1.HAP.Characteristic.CurrentHeatingCoolingState.OFF;
    }
}
exports.runningStateToCurrentHeatingCoolingState = runningStateToCurrentHeatingCoolingState;
function translateCurrentStateFromSystemMode(val) {
    switch (val) {
        case 'heat':
            return index_1.HAP.Characteristic.CurrentHeatingCoolingState.HEAT;
        case 'cool':
            return index_1.HAP.Characteristic.CurrentHeatingCoolingState.COOL;
        default:
            return index_1.HAP.Characteristic.CurrentHeatingCoolingState.OFF;
    }
}
exports.translateCurrentStateFromSystemMode = translateCurrentStateFromSystemMode;
function translateTargetStateFromSystemMode(val) {
    switch (val) {
        case 'heat':
            return index_1.HAP.Characteristic.TargetHeatingCoolingState.HEAT;
        case 'cool':
            return index_1.HAP.Characteristic.TargetHeatingCoolingState.COOL;
        case 'auto':
            return index_1.HAP.Characteristic.TargetHeatingCoolingState.AUTO;
        default:
            return index_1.HAP.Characteristic.TargetHeatingCoolingState.OFF;
    }
}
exports.translateTargetStateFromSystemMode = translateTargetStateFromSystemMode;
function translateTargetStateToSystemMode(val) {
    switch (val) {
        case index_1.HAP.Characteristic.TargetHeatingCoolingState.HEAT:
            return 'heat';
        case index_1.HAP.Characteristic.TargetHeatingCoolingState.COOL:
            return 'cool';
        case index_1.HAP.Characteristic.TargetHeatingCoolingState.AUTO:
            return 'auto';
        default:
            return 'off';
    }
}
exports.translateTargetStateToSystemMode = translateTargetStateToSystemMode;
class ThermostatServiceBuilder extends service_builder_1.ServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform, accessory, client, state);
        this.service =
            this.accessory.getService(platform.Service.Thermostat) ||
                this.accessory.addService(platform.Service.Thermostat);
    }
    withCurrentHeatingCoolingState() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                callback(null, translateCurrentStateFromSystemMode(this.state.system_mode));
            }
            catch (e) {
                callback(e);
            }
        }));
        return this;
    }
    withTargetHeatingCoolingState(asAuto, asOff) {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .on("set" /* SET */, (state, callback) => __awaiter(this, void 0, void 0, function* () {
            let translatedMode = translateTargetStateToSystemMode(state);
            if (asAuto &&
                Array.isArray(asAuto) &&
                asAuto.length > 0 &&
                asAuto.includes(translatedMode)) {
                translatedMode = 'auto';
            }
            if (asOff && Array.isArray(asOff) && asOff.length > 0 && asOff.includes(translatedMode)) {
                translatedMode = 'off';
            }
            try {
                Object.assign(this.state, yield this.client.setSystemMode(this.device, translatedMode));
                callback();
            }
            catch (e) {
                callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                callback(null, translateTargetStateFromSystemMode(this.state.system_mode));
            }
            catch (e) {
                callback(e);
            }
        }));
        return this;
    }
    withCurrentTemperature() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, this.state.local_temperature);
        }));
        return this;
    }
    withTargetTemperature(min, max) {
        const Characteristic = this.platform.Characteristic;
        const temperatureFixer = getTemperatureFixer(min, max);
        this.service
            .getCharacteristic(Characteristic.TargetTemperature)
            .on("set" /* SET */, (targetTemp, callback) => __awaiter(this, void 0, void 0, function* () {
            const temperature = temperatureFixer(targetTemp);
            try {
                Object.assign(this.state, yield this.client.setCurrentHeatingSetpoint(this.device, temperature));
                callback();
            }
            catch (e) {
                callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.TargetTemperature)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, temperatureFixer(this.state.current_heating_setpoint));
        }));
        return this;
    }
}
exports.ThermostatServiceBuilder = ThermostatServiceBuilder;
exports.MIN_TEMP = 10;
exports.MAX_TEMP = 38;
function getTemperatureFixer(min, max) {
    const minTemp = Math.max(min, exports.MIN_TEMP); // 10 is the minimum accepted by HK
    const maxTemp = Math.min(max, exports.MAX_TEMP); // 38 is the maximum accepted by HK
    return (targetTemp) => Math.min(Math.max(targetTemp || exports.MIN_TEMP, minTemp), maxTemp);
}
exports.getTemperatureFixer = getTemperatureFixer;
//# sourceMappingURL=thermostat-service-builder.js.map