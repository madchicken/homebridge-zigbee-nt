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
exports.HumiditySensorServiceBuilder = void 0;
const sensor_service_builder_1 = require("./sensor-service-builder");
const lodash_1 = require("lodash");
class HumiditySensorServiceBuilder extends sensor_service_builder_1.SensorServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform.Service.HumiditySensor, platform, accessory, client, state);
    }
    withHumidity() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, Math.round(lodash_1.get(this.state, 'humidity', 0)));
        }));
        return this;
    }
}
exports.HumiditySensorServiceBuilder = HumiditySensorServiceBuilder;
//# sourceMappingURL=humidity-sensor-service-builder.js.map