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
exports.IkeaMotionSensor = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
class IkeaMotionSensor extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        const Service = this.platform.api.hap.Service;
        const Characteristic = this.platform.api.hap.Characteristic;
        this.sensorService =
            this.accessory.getService(Service.MotionSensor) ||
                this.accessory.addService(Service.MotionSensor);
        this.sensorService.setCharacteristic(Characteristic.Name, this.friendlyName);
        this.sensorService
            .getCharacteristic(Characteristic.MotionDetected)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            if (this.state.occupancy) {
                this.log.debug(`Motion detected for sensor ${this.friendlyName}`);
            }
            callback(null, this.state.occupancy === true);
        }));
        this.sensorService
            .getCharacteristic(Characteristic.StatusLowBattery)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, this.state.battery && this.state.battery <= 10
                ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
        }));
        this.batteryService =
            this.accessory.getService(Service.BatteryService) ||
                this.accessory.addService(Service.BatteryService);
        return [this.sensorService, this.batteryService];
    }
}
exports.IkeaMotionSensor = IkeaMotionSensor;
//# sourceMappingURL=ikea-motion-sensor.js.map