"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IkeaTradfriDimColortemp = void 0;
const lighbulb_service_builder_1 = require("../../builders/lighbulb-service-builder");
const ikea_tradfri_dim_1 = require("./ikea-tradfri-dim");
class IkeaTradfriDimColortemp extends ikea_tradfri_dim_1.IkeaTradfriDim {
    constructor(platform, accessory, client, device) {
        super(platform, accessory, client, device);
    }
    getAvailableServices() {
        this.lightbulbService = new lighbulb_service_builder_1.LighbulbServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withOnOff()
            .withBrightness()
            .withColorTemperature()
            .build();
        return [this.lightbulbService];
    }
}
exports.IkeaTradfriDimColortemp = IkeaTradfriDimColortemp;
//# sourceMappingURL=ikea-tradfri-dim-colortemp.js.map