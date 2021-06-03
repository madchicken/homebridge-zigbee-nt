"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IkeaTradfriOutlet = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const outlet_service_builder_1 = require("../../builders/outlet-service-builder");
class IkeaTradfriOutlet extends zig_bee_accessory_1.ZigBeeAccessory {
    constructor(platform, accessory, client, device) {
        super(platform, accessory, client, device);
    }
    getAvailableServices() {
        this.service = new outlet_service_builder_1.OutletServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withOnOff()
            .build();
        return [this.service];
    }
}
exports.IkeaTradfriOutlet = IkeaTradfriOutlet;
//# sourceMappingURL=ikea-tradfri-outlet.js.map