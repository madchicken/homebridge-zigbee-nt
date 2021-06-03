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
exports.LeakSensorServiceBuilder = void 0;
const sensor_service_builder_1 = require("./sensor-service-builder");
class LeakSensorServiceBuilder extends sensor_service_builder_1.SensorServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform.Service.LeakSensor, platform, accessory, client, state);
    }
    withWaterLeak() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.LeakDetected)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            const leakDetected = this.state.water_leak === true;
            callback(null, leakDetected
                ? Characteristic.LeakDetected.LEAK_DETECTED
                : Characteristic.LeakDetected.LEAK_NOT_DETECTED);
        }));
        return this;
    }
    withGasLeak() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.LeakDetected)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            const leakDetected = this.state.gas === true;
            callback(null, leakDetected
                ? Characteristic.LeakDetected.LEAK_DETECTED
                : Characteristic.LeakDetected.LEAK_NOT_DETECTED);
        }));
        return this;
    }
    withSmokeLeak() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.LeakDetected)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            const leakDetected = this.state.smoke === true;
            callback(null, leakDetected
                ? Characteristic.LeakDetected.LEAK_DETECTED
                : Characteristic.LeakDetected.LEAK_NOT_DETECTED);
        }));
        return this;
    }
}
exports.LeakSensorServiceBuilder = LeakSensorServiceBuilder;
//# sourceMappingURL=leak-sensor-service-builder.js.map