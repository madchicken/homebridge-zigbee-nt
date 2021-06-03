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
exports.SwitchServiceBuilder = void 0;
const service_builder_1 = require("./service-builder");
class SwitchServiceBuilder extends service_builder_1.ServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform, accessory, client, state);
        this.service =
            this.accessory.getService(platform.Service.Switch) ||
                this.accessory.addService(platform.Service.Switch);
    }
    withOnOff() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.On)
            .on("set" /* SET */, (yes, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                Object.assign(this.state, yield this.client.setOnState(this.device, yes));
                callback();
            }
            catch (e) {
                callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.On)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            this.client.getOnOffState(this.device).catch(e => this.log.error(e.message));
            callback(null, this.state.state === 'ON');
        }));
        return this;
    }
}
exports.SwitchServiceBuilder = SwitchServiceBuilder;
//# sourceMappingURL=switch-service-builder.js.map