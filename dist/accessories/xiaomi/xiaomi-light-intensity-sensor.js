"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XiaomiLightIntensitySensor = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const battery_service_builder_1 = require("../../builders/battery-service-builder");
const ambient_light_service_builder_1 = require("../../builders/ambient-light-service-builder");
class XiaomiLightIntensitySensor extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        this.ambientLightService = new ambient_light_service_builder_1.AmbientLightServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withAmbientLightLevel()
            .build();
        this.batteryService = new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withBatteryPercentage()
            .build();
        return [this.ambientLightService, this.batteryService];
    }
}
exports.XiaomiLightIntensitySensor = XiaomiLightIntensitySensor;
//# sourceMappingURL=xiaomi-light-intensity-sensor.js.map