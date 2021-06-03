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
exports.IkeaTradfriDim = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const lighbulb_service_builder_1 = require("../../builders/lighbulb-service-builder");
class IkeaTradfriDim extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        this.lightbulbService = new lighbulb_service_builder_1.LighbulbServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withOnOff()
            .withBrightness()
            .build();
        return [this.lightbulbService];
    }
    handleAccessoryIdentify() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.identify(this.zigBeeDeviceDescriptor);
        });
    }
}
exports.IkeaTradfriDim = IkeaTradfriDim;
//# sourceMappingURL=ikea-tradfri-dim.js.map