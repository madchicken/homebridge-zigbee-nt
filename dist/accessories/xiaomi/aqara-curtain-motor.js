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
        this.state = {};
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
        Object.assign(this.state, state);

        this.updatePositionState();
        this.adjustPosition();

        this.platform.log.info(`[AqaraCurtainMotorGeneral] Got update - state: ${JSON.stringify(state)}`);
        this.platform.log.info(`[AqaraCurtainMotorGeneral] After update - state: ${JSON.stringify(this.state)}`);
    }

    updatePositionState() {
        if (this.state.running) {
            this.state.state = this.state.position <= this.state.position_target
                ? this.Characteristic.PositionState.INCREASING
                : this.Characteristic.PositionState.DECREASING;
        } else this.state.state = this.Characteristic.PositionState.STOPPED;
    }

    adjustPosition() {
        if (this.state.position_target !== this.state.position) {
            this.move(this.state.position_target);
        }
    }

    move(value) {
        this.client.setCustomState(this.device, {position: value});
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