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
exports.TemperatureSensorServiceBuilder = void 0;
const sensor_service_builder_1 = require("./sensor-service-builder");
class TemperatureSensorServiceBuilder extends sensor_service_builder_1.SensorServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform.Service.TemperatureSensor, platform, accessory, client, state);
    }
    withTemperature() {
        const Characteristic = this.platform.Characteristic;
        this.state.temperature = 0;
        this.service
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, this.state.temperature);
        }));
        return this;
    }
}
exports.TemperatureSensorServiceBuilder = TemperatureSensorServiceBuilder;
//# sourceMappingURL=temperature-sensor-service-builder.js.map