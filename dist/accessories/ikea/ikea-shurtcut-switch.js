"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IkeaShurtcutSwitch = void 0;
const battery_service_builder_1 = require("../../builders/battery-service-builder");
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const programmable_switch_service_builder_1 = require("../../builders/programmable-switch-service-builder");
class IkeaShurtcutSwitch extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        const builder = new programmable_switch_service_builder_1.ProgrammableSwitchServiceBuilder(this.platform, this.accessory, this.client, this.state);
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        [this.switchServiceOn] = builder
            .withStatelessSwitch('ON', 'on', 1, [
            ProgrammableSwitchEvent.SINGLE_PRESS,
            ProgrammableSwitchEvent.LONG_PRESS,
        ])
            .build();
        this.batteryService = new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withBatteryPercentage()
            .build();
        return [this.switchServiceOn, this.batteryService];
    }
    update(state) {
        super.update(state);
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        switch (state.action) {
            case 'brightness_move_up':
            case 'brightness_move_down':
                this.switchServiceOn
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.LONG_PRESS);
                break;
            case 'on':
                this.switchServiceOn
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
        }
    }
}
exports.IkeaShurtcutSwitch = IkeaShurtcutSwitch;
//# sourceMappingURL=ikea-shurtcut-switch.js.map