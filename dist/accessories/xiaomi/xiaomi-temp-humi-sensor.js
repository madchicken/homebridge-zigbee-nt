"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XiaomiTempHumiSensor = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const temperature_sensor_service_builder_1 = require("../../builders/temperature-sensor-service-builder");
const humidity_sensor_service_builder_1 = require("../../builders/humidity-sensor-service-builder");
const battery_service_builder_1 = require("../../builders/battery-service-builder");
class XiaomiTempHumiSensor extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        this.temperatureService = new temperature_sensor_service_builder_1.TemperatureSensorServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withTemperature()
            .build();
        this.humidityService = new humidity_sensor_service_builder_1.HumiditySensorServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withHumidity()
            .build();
        this.batteryService = new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withBatteryPercentage()
            .build();
        return [this.temperatureService, this.humidityService, this.batteryService];
    }
}
exports.XiaomiTempHumiSensor = XiaomiTempHumiSensor;
//# sourceMappingURL=xiaomi-temp-humi-sensor.js.map