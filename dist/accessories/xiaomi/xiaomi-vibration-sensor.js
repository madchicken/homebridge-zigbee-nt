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
exports.XiaomiVibrationSensor = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const battery_service_builder_1 = require("../../builders/battery-service-builder");
class XiaomiVibrationSensor extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        const Characteristic = this.platform.Characteristic;
        this.contactService =
            this.accessory.getService(this.platform.Service.ContactSensor) ||
                this.accessory.addService(this.platform.Service.ContactSensor);
        this.contactService
            .getCharacteristic(Characteristic.ContactSensorState)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            this.log.debug(`XiaomiVibrationSensor get Vibration Sensor State for ${this.accessory.displayName}`, this.state);
            const vibrationDetected = this.state.strength || this.state.action;
            callback(null, vibrationDetected
                ? Characteristic.ContactSensorState.CONTACT_DETECTED
                : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
        }));
        const supportedServices = [this.contactService];
        if (this.supports('battery')) {
            this.batteryService = new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
                .withBatteryPercentage()
                .build();
            supportedServices.push(this.batteryService);
        }
        return supportedServices;
    }
    update(state) {
        const Characteristic = this.platform.Characteristic;
        const vibrationDetected = state.strength || state.action;
        this.contactService
            .getCharacteristic(Characteristic.ContactSensorState)
            .setValue(vibrationDetected
            ? Characteristic.ContactSensorState.CONTACT_DETECTED
            : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
        this.batteryService.updateCharacteristic(Characteristic.BatteryLevel, state.battery || 0);
        this.batteryService.updateCharacteristic(Characteristic.StatusLowBattery, state.battery && state.battery < 10);
    }
}
exports.XiaomiVibrationSensor = XiaomiVibrationSensor;
//# sourceMappingURL=xiaomi-vibration-sensor.js.map