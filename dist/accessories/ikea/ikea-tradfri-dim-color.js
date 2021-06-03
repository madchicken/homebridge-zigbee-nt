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
exports.IkeaTradfriDimColor = void 0;
const lighbulb_service_builder_1 = require("../../builders/lighbulb-service-builder");
const ikea_tradfri_dim_1 = require("./ikea-tradfri-dim");
class IkeaTradfriDimColor extends ikea_tradfri_dim_1.IkeaTradfriDim {
    constructor(platform, accessory, client, device) {
        super(platform, accessory, client, device);
    }
    getAvailableServices() {
        this.lightbulbService = new lighbulb_service_builder_1.LighbulbServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withOnOff()
            .withColorXY()
            .build();
        return [this.lightbulbService];
    }
    onDeviceMount() {
        const _super = Object.create(null, {
            onDeviceMount: { get: () => super.onDeviceMount }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.onDeviceMount.call(this);
            const color = yield this.client.getColorCapabilities(this.zigBeeDeviceDescriptor);
            this.log.info(`Re-read color capabilities for ${this.friendlyName}`, color);
        });
    }
}
exports.IkeaTradfriDimColor = IkeaTradfriDimColor;
//# sourceMappingURL=ikea-tradfri-dim-color.js.map