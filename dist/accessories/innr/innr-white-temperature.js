"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InnrWhiteTemperature = void 0;
const lighbulb_service_builder_1 = require("../../builders/lighbulb-service-builder");
const innr_white_1 = require("./innr-white");
class InnrWhiteTemperature extends innr_white_1.InnrWhite {
    getAvailableServices() {
        const lightbulbService = new lighbulb_service_builder_1.LighbulbServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withOnOff()
            .withBrightness()
            .withColorTemperature()
            .build();
        return [lightbulbService];
    }
}
exports.InnrWhiteTemperature = InnrWhiteTemperature;
//# sourceMappingURL=innr-white-temperature.js.map