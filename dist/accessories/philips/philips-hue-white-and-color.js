"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhilipsHueWhiteAndColor = void 0;
const lighbulb_service_builder_1 = require("../../builders/lighbulb-service-builder");
const philips_hue_white_1 = require("./philips-hue-white");
class PhilipsHueWhiteAndColor extends philips_hue_white_1.PhilipsHueWhite {
    getAvailableServices() {
        const lightbulbService = new lighbulb_service_builder_1.LighbulbServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withOnOff()
            .withColorXY()
            .build();
        return [lightbulbService];
    }
}
exports.PhilipsHueWhiteAndColor = PhilipsHueWhiteAndColor;
//# sourceMappingURL=philips-hue-white-and-color.js.map