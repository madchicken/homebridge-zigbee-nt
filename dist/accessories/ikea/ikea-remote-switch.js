"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IkeaRemoteSwitch = void 0;
const battery_service_builder_1 = require("../../builders/battery-service-builder");
const zig_bee_accessory_1 = require("../zig-bee-accessory");
const programmable_switch_service_builder_1 = require("../../builders/programmable-switch-service-builder");
class IkeaRemoteSwitch extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        const builder = new programmable_switch_service_builder_1.ProgrammableSwitchServiceBuilder(this.platform, this.accessory, this.client, this.state);
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        [
            this.switchServiceToggle,
            this.switchServiceBrightUp,
            this.switchServiceBrightDown,
            this.switchServiceLeft,
            this.switchServiceRight,
        ] = builder
            .withStatelessSwitch('ON/OFF', 'toggle', 1, [ProgrammableSwitchEvent.SINGLE_PRESS])
            .withStatelessSwitch('Brightness up', 'brightness_up', 2, [
            ProgrammableSwitchEvent.SINGLE_PRESS,
            ProgrammableSwitchEvent.LONG_PRESS,
        ])
            .withStatelessSwitch('Brightness down', 'brightness_down', 3, [
            ProgrammableSwitchEvent.SINGLE_PRESS,
            ProgrammableSwitchEvent.LONG_PRESS,
        ])
            .withStatelessSwitch('Left', 'left', 4, [
            ProgrammableSwitchEvent.SINGLE_PRESS,
            ProgrammableSwitchEvent.LONG_PRESS,
        ])
            .withStatelessSwitch('Right', 'right', 5, [
            ProgrammableSwitchEvent.SINGLE_PRESS,
            ProgrammableSwitchEvent.LONG_PRESS,
        ])
            .build();
        this.batteryService = new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withBatteryPercentage()
            .build();
        return [
            this.switchServiceToggle,
            this.switchServiceBrightUp,
            this.switchServiceBrightDown,
            this.switchServiceLeft,
            this.switchServiceRight,
            this.batteryService,
        ];
    }
    update(state) {
        super.update(state);
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        switch (state.action) {
            case 'brightness_up_click':
                this.switchServiceBrightUp
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
            case 'brightness_down_click':
                this.switchServiceBrightDown
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
            case 'toggle':
                this.switchServiceToggle
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
            case 'arrow_left_click':
                this.switchServiceLeft
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
            case 'arrow_right_click':
                this.switchServiceRight
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
            // LONG press
            case 'brightness_up_hold':
                this.switchServiceBrightUp
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.LONG_PRESS);
                break;
            case 'brightness_down_hold':
                this.switchServiceBrightDown
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.LONG_PRESS);
                break;
            case 'arrow_left_hold':
                this.switchServiceLeft
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.LONG_PRESS);
                break;
            case 'arrow_right_hold':
                this.switchServiceRight
                    .getCharacteristic(ProgrammableSwitchEvent)
                    .setValue(ProgrammableSwitchEvent.LONG_PRESS);
                break;
        }
    }
}
exports.IkeaRemoteSwitch = IkeaRemoteSwitch;
//# sourceMappingURL=ikea-remote-switch.js.map