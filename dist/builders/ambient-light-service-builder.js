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
exports.AmbientLightServiceBuilder = void 0;
const service_builder_1 = require("./service-builder");
const lodash_1 = require("lodash");
class AmbientLightServiceBuilder extends service_builder_1.ServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform, accessory, client, state);
        this.service =
            this.accessory.getService(this.platform.Service.LightSensor) ||
                this.accessory.addService(this.platform.Service.LightSensor);
    }
    withAmbientLightLevel() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            const lux = lodash_1.get(this.state, 'illuminance_lux', 0.0001);
            this.log.debug(`Getting state for ambient light sensor ${this.friendlyName}: ${lux}`);
            callback(null, lux);
        }));
        return this;
    }
}
exports.AmbientLightServiceBuilder = AmbientLightServiceBuilder;
//# sourceMappingURL=ambient-light-service-builder.js.map