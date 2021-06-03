"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IkeaOnoffSwitch = void 0;
const battery_service_builder_1 = require("../../builders/battery-service-builder");
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const programmable_switch_service_builder_1 = require("../../builders/programmable-switch-service-builder");
class IkeaOnoffSwitch extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        const builder = new programmable_switch_service_builder_1.ProgrammableSwitchServiceBuilder(this.platform, this.accessory, this.client, this.state);
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        [this.switchServiceOn, this.switchServiceOff] = builder
            .withStatelessSwitch('ON', 'on', 1, [
            ProgrammableSwitchEvent.SINGLE_PRESS,
            ProgrammableSwitchEvent.LONG_PRESS,
        ])
            .withStatelessSwitch('OFF', 'off', 2, [
            ProgrammableSwitchEvent.SINGLE_PRESS,
            ProgrammableSwitchEvent.LONG_PRESS,
        ])
            .build();
        this.batteryService = new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withBatteryPercentage()
            .build();
        return [this.switchServiceOn, this.switchServiceOff, this.batteryService];
    }
    update(state) {
        super.update(state);
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        switch (state.action) {
            case 'brightness_move_up':
                this.switchServiceOn
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.LONG_PRESS);
                break;
            case 'brightness_move_down':
                this.switchServiceOff
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.LONG_PRESS);
                break;
            case 'on':
                this.switchServiceOn
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
            case 'off':
                this.switchServiceOff
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
        }
    }
}
exports.IkeaOnoffSwitch = IkeaOnoffSwitch;
//# sourceMappingURL=ikea-onoff-switch.js.map