"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XiaomiWirelessSwitch = void 0;
const battery_service_builder_1 = require("../../builders/battery-service-builder");
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const programmable_switch_service_builder_1 = require("../../builders/programmable-switch-service-builder");
class XiaomiWirelessSwitch extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        const builder = new programmable_switch_service_builder_1.ProgrammableSwitchServiceBuilder(this.platform, this.accessory, this.client, this.state);
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        [this.switchService] = builder
            .withStatelessSwitch('ON/OFF', 'toggle', 1, [
            ProgrammableSwitchEvent.SINGLE_PRESS,
            ProgrammableSwitchEvent.DOUBLE_PRESS,
            ProgrammableSwitchEvent.LONG_PRESS,
        ])
            .build();
        this.batteryService = new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withBatteryPercentage()
            .build();
        return [this.switchService, this.batteryService];
    }
    update(state) {
        super.update(state);
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        switch (state.action) {
            case 'single':
                this.switchService
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
            case 'hold':
                this.switchService
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.LONG_PRESS);
                break;
            case 'double':
                this.switchService
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
                break;
        }
    }
}
exports.XiaomiWirelessSwitch = XiaomiWirelessSwitch;
//# sourceMappingURL=xiaomi-wireless-switch.js.map