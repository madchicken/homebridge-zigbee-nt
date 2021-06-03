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
exports.ContactSensorServiceBuilder = void 0;
const sensor_service_builder_1 = require("./sensor-service-builder");
class ContactSensorServiceBuilder extends sensor_service_builder_1.SensorServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform.Service.ContactSensor, platform, accessory, client, state);
        state.contact = false;
    }
    withContact() {
        const Characteristic = this.platform.Characteristic;
        this.state.contact = true; // default is closed
        this.service
            .getCharacteristic(Characteristic.ContactSensorState)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, this.state.contact
                ? Characteristic.ContactSensorState.CONTACT_DETECTED
                : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
        }));
        return this;
    }
    withVibration() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.ContactSensorState)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            const vibrationDetected = this.state.strength || this.state.action;
            callback(null, vibrationDetected
                ? Characteristic.ContactSensorState.CONTACT_DETECTED
                : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
        }));
        return this;
    }
}
exports.ContactSensorServiceBuilder = ContactSensorServiceBuilder;
//# sourceMappingURL=contact-sensor-service-builder.js.map