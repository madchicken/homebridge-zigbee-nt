"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XiaomiMotionIlluminanceSensor = void 0;
const xiaomi_motion_sensor_1 = require("./xiaomi-motion-sensor");
const ambient_light_service_builder_1 = require("../../builders/ambient-light-service-builder");
class XiaomiMotionIlluminanceSensor extends xiaomi_motion_sensor_1.XiaomiMotionSensor {
    getAvailableServices() {
        const services = super.getAvailableServices();
        this.illuminanceService = new ambient_light_service_builder_1.AmbientLightServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withAmbientLightLevel()
            .build();
        services.push(this.illuminanceService);
        return services;
    }
}
exports.XiaomiMotionIlluminanceSensor = XiaomiMotionIlluminanceSensor;
//# sourceMappingURL=xiaomi-motion-illuminance-sensor.js.map