"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XiaomiMotionSensor = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const motion_sensor_service_builder_1 = require("../../builders/motion-sensor-service-builder");
const battery_service_builder_1 = require("../../builders/battery-service-builder");
class XiaomiMotionSensor extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        this.sensorService = new motion_sensor_service_builder_1.MotionSensorServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withOccupancy()
            .build();
        this.batteryService = new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withBatteryPercentage()
            .build();
        return [this.sensorService, this.batteryService];
    }
}
exports.XiaomiMotionSensor = XiaomiMotionSensor;
//# sourceMappingURL=xiaomi-motion-sensor.js.map