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
exports.PermitJoinAccessory = void 0;
class PermitJoinAccessory {
    constructor(platform, accessory, zigBeeClient) {
        this.zigBeeClient = zigBeeClient;
        // Current progress status
        this.inProgress = false;
        // Save platform
        this.platform = platform;
        this.accessory = accessory;
        // Verify accessory
        const serialNumber = Math.random()
            .toString(36)
            .substr(2, 10);
        const Characteristic = platform.Characteristic;
        this.accessory
            .getService(platform.Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, 'None')
            .setCharacteristic(Characteristic.Model, 'None')
            .setCharacteristic(Characteristic.SerialNumber, serialNumber)
            .setCharacteristic(Characteristic.FirmwareRevision, '1.0.0')
            .setCharacteristic(platform.Characteristic.Name, 'ZigBee Permit Join');
        this.switchService =
            this.accessory.getService(platform.Service.Switch) ||
                this.accessory.addService(platform.Service.Switch);
        this.accessory.on('identify', () => this.handleAccessoryIdentify());
        const characteristic = this.switchService.getCharacteristic(this.platform.Characteristic.On);
        characteristic.on("get" /* GET */, callback => this.handleGetSwitchOn(callback));
        characteristic.on("set" /* SET */, (value, callback) => {
            this.handleSetSwitchOn(value, callback);
        });
        // Disable permit join on start
        this.setPermitJoin(false);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleAccessoryIdentify() { }
    setPermitJoin(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.zigBeeClient.permitJoin(value);
            this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(value);
            this.inProgress = value;
        });
    }
    handleGetSwitchOn(callback) {
        callback(null, this.inProgress);
    }
    handleSetSwitchOn(value, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setPermitJoin(value);
            callback();
        });
    }
}
exports.PermitJoinAccessory = PermitJoinAccessory;
//# sourceMappingURL=permit-join-accessory.js.map