"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AqaraCurtainMotor = void 0;
const battery_service_builder_1 = require("../../builders/battery-service-builder");
const window_cover_service_builder_1 = require("../../builders/window-cover-service-builder");
const zig_bee_accessory_1 = require("../zig-bee-accessory");
class AqaraCurtainMotorGeneral extends zig_bee_accessory_1.ZigBeeAccessory {
    constructor() {
        super(...arguments);
        this.withBattery = false;
    }
    getAvailableServices() {
        const builder = new window_cover_service_builder_1.WindowCoverServiceBuilder(this.platform, this.accessory, this.client, this.state);
        this.services = [builder.build()];
        if (this.withBattery) {
            this.services.push(new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
                .withBatteryPercentage()
                .build());
        }
        return this.services;
    }
    update(state) {
        super.update(state);
    }
}
class AqaraCurtainMotor extends AqaraCurtainMotorGeneral {
    constructor(platform, accessory, client, device) {
        super(platform, accessory, client, device);
        this.withBattery = false;
    }
}
exports.AqaraCurtainMotor = AqaraCurtainMotor;
//# sourceMappingURL=aqara-curtain-motor.js.map