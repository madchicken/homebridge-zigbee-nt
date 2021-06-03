"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LonsonhoDoubleSwitch = void 0;
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const programmable_switch_service_builder_1 = require("../../builders/programmable-switch-service-builder");
class LonsonhoDoubleSwitch extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        const builder = new programmable_switch_service_builder_1.ProgrammableSwitchServiceBuilder(this.platform, this.accessory, this.client, this.state);
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        [
            this.switch1ServiceOn,
            this.switch1ServiceOff,
            this.switch2ServiceOn,
            this.switch2ServiceOff,
        ] = builder
            .withStatelessSwitch('BTN 1 ON', 'on', 1, [ProgrammableSwitchEvent.SINGLE_PRESS])
            .withStatelessSwitch('BTN 1 OFF', 'off', 2, [ProgrammableSwitchEvent.SINGLE_PRESS])
            .withStatelessSwitch('BTN 2 ON', 'on', 3, [ProgrammableSwitchEvent.SINGLE_PRESS])
            .withStatelessSwitch('BTN 2 OFF', 'off', 4, [ProgrammableSwitchEvent.SINGLE_PRESS])
            .build();
        return [
            this.switch1ServiceOn,
            this.switch1ServiceOff,
            this.switch2ServiceOn,
            this.switch2ServiceOff,
        ];
    }
    update(state) {
        super.update(state);
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        switch (state.state_l1) {
            case 'ON':
                this.switch1ServiceOn
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
            case 'OFF':
                this.switch1ServiceOff
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
        }
        switch (state.state_l2) {
            case 'ON':
                this.switch2ServiceOn
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
            case 'OFF':
                this.switch2ServiceOff
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
        }
    }
}
exports.LonsonhoDoubleSwitch = LonsonhoDoubleSwitch;
//# sourceMappingURL=lonsonho-double-switch.js.map