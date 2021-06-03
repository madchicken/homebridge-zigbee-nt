"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XiaomiContactSensor = void 0;
const contact_sensor_service_builder_1 = require("../../builders/contact-sensor-service-builder");
const battery_service_builder_1 = require("../../builders/battery-service-builder");
const zig_bee_accessory_1 = require("../zig-bee-accessory");
class XiaomiContactSensor extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        this.contactService = new contact_sensor_service_builder_1.ContactSensorServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withContact()
            .build();
        this.batteryService = new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withBatteryPercentage()
            .build();
        return [this.contactService, this.batteryService];
    }
}
exports.XiaomiContactSensor = XiaomiContactSensor;
//# sourceMappingURL=xiaomi-contact-sensor.js.map