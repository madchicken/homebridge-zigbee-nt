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
exports.TuyaOnoffDoubleSwitch = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
class TuyaOnoffDoubleSwitch extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        const Characteristic = this.platform.api.hap.Characteristic;
        this.switchServiceButtonLeft =
            this.accessory.getServiceById(this.platform.Service.StatefulProgrammableSwitch, 'button_left') ||
                this.accessory.addService(this.platform.Service.StatefulProgrammableSwitch, 'Left Button', 'button_left');
        this.switchServiceButtonRight =
            this.accessory.getServiceById(this.platform.Service.StatefulProgrammableSwitch, 'button_right') ||
                this.accessory.addService(this.platform.Service.StatefulProgrammableSwitch, 'Right Button', 'button_right');
        this.switchServiceButtonLeft.setCharacteristic(this.platform.Characteristic.Name, 'Button Left');
        this.switchServiceButtonLeft.setCharacteristic(this.platform.Characteristic.ServiceLabelIndex, 1);
        this.switchServiceButtonLeft
            .getCharacteristic(Characteristic.ProgrammableSwitchOutputState)
            .on("get" /* GET */, (callback) => {
            callback(null, this.state.state_left === 'ON' ? 1 : 0);
        })
            .on("set" /* SET */, (outputState, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.setLeftButtonOn(this.zigBeeDeviceDescriptor, outputState === 1);
                callback(null, outputState);
            }
            catch (e) {
                callback(e);
            }
        }));
        this.switchServiceButtonRight.setCharacteristic(this.platform.Characteristic.Name, 'Button Right');
        this.switchServiceButtonRight.setCharacteristic(this.platform.Characteristic.ServiceLabelIndex, 2);
        this.switchServiceButtonLeft
            .getCharacteristic(Characteristic.ProgrammableSwitchOutputState)
            .on("get" /* GET */, (callback) => {
            callback(null, this.state.state_right === 'ON' ? 1 : 0);
        })
            .on("set" /* SET */, (outputState, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.setRightButtonOn(this.zigBeeDeviceDescriptor, outputState === 1);
                callback(null, outputState);
            }
            catch (e) {
                callback(e);
            }
        }));
        return [this.switchServiceButtonLeft, this.switchServiceButtonRight];
    }
    update(state) {
        const Characteristic = this.platform.api.hap.Characteristic;
        switch (state.state_left) {
            case 'ON':
                this.switchServiceButtonLeft.setCharacteristic(Characteristic.ProgrammableSwitchOutputState, 1);
                break;
            case 'OFF':
                this.switchServiceButtonLeft.setCharacteristic(Characteristic.ProgrammableSwitchOutputState, 0);
                break;
        }
        switch (state.state_right) {
            case 'ON':
                this.switchServiceButtonRight.setCharacteristic(Characteristic.ProgrammableSwitchOutputState, 1);
                break;
            case 'OFF':
                this.switchServiceButtonRight.setCharacteristic(Characteristic.ProgrammableSwitchOutputState, 0);
                break;
        }
    }
}
exports.TuyaOnoffDoubleSwitch = TuyaOnoffDoubleSwitch;
//# sourceMappingURL=tuya-onoff-double-switch.js.map