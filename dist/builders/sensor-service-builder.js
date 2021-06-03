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
exports.SensorServiceBuilder = void 0;
const service_builder_1 = require("./service-builder");
class SensorServiceBuilder extends service_builder_1.ServiceBuilder {
    constructor(service, platform, accessory, client, state) {
        super(platform, accessory, client, state);
        this.service = this.accessory.getService(service) || this.accessory.addService(service);
    }
    withBatteryLow() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.StatusLowBattery)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, this.state.battery_low
                ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
        }));
        return this;
    }
    withTamper() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.StatusTampered)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, this.state.tamper
                ? Characteristic.StatusTampered.TAMPERED
                : Characteristic.StatusTampered.NOT_TAMPERED);
        }));
        return this;
    }
}
exports.SensorServiceBuilder = SensorServiceBuilder;
//# sourceMappingURL=sensor-service-builder.js.map