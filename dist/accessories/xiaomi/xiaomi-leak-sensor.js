"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XiaomiLeakSensor = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const battery_service_builder_1 = require("../../builders/battery-service-builder");
const leak_sensor_service_builder_1 = require("../../builders/leak-sensor-service-builder");
class XiaomiLeakSensor extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        this.leakService = new leak_sensor_service_builder_1.LeakSensorServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withWaterLeak()
            .build();
        this.batteryService = new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withBatteryPercentage()
            .build();
        return [this.leakService, this.batteryService];
    }
}
exports.XiaomiLeakSensor = XiaomiLeakSensor;
//# sourceMappingURL=xiaomi-leak-sensor.js.map