"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhilipsHueWhiteTemperature = void 0;
const lighbulb_service_builder_1 = require("../../builders/lighbulb-service-builder");
const philips_hue_white_1 = require("./philips-hue-white");
class PhilipsHueWhiteTemperature extends philips_hue_white_1.PhilipsHueWhite {
    getAvailableServices() {
        const lightbulbService = new lighbulb_service_builder_1.LighbulbServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withOnOff()
            .withBrightness()
            .withColorTemperature()
            .build();
        return [lightbulbService];
    }
}
exports.PhilipsHueWhiteTemperature = PhilipsHueWhiteTemperature;
//# sourceMappingURL=philips-hue-white-temperature.js.map