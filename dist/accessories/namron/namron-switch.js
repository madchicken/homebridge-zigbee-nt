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
exports.NamronSwitch = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const switch_service_builder_1 = require("../../builders/switch-service-builder");
class NamronSwitch extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        this.service = new switch_service_builder_1.SwitchServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withOnOff()
            .build();
        return [this.service];
    }
    handleAccessoryIdentify() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.identify(this.zigBeeDeviceDescriptor);
        });
    }
}
exports.NamronSwitch = NamronSwitch;
//# sourceMappingURL=namron-switch.js.map