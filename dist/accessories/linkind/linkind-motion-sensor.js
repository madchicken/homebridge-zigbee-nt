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
exports.LinkindMotionSensor = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
class LinkindMotionSensor extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        const Service = this.platform.api.hap.Service;
        const Characteristic = this.platform.api.hap.Characteristic;
        this.sensorService =
            this.accessory.getService(Service.OccupancySensor) ||
                this.accessory.addService(Service.OccupancySensor);
        this.sensorService.setCharacteristic(Characteristic.Name, this.friendlyName);
        this.sensorService
            .getCharacteristic(Characteristic.OccupancyDetected)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            if (this.state.contact) {
                this.log.debug(`Motion detected for sensor ${this.friendlyName}`);
            }
            callback(null, this.state.occupancy
                ? Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
                : Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
        }));
        this.sensorService
            .getCharacteristic(Characteristic.StatusLowBattery)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, this.state.battery_low
                ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
        }));
        return [this.sensorService];
    }
}
exports.LinkindMotionSensor = LinkindMotionSensor;
//# sourceMappingURL=linkind-motion-sensor.js.map