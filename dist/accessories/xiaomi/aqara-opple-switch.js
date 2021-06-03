"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AqaraOppleSwitch6Buttons = exports.AqaraOppleSwitch4Buttons = exports.AqaraOppleSwitch2Buttons = exports.EventType = void 0;
const battery_service_builder_1 = require("../../builders/battery-service-builder");
const programmable_switch_service_builder_1 = require("../../builders/programmable-switch-service-builder");
const zig_bee_accessory_1 = require("../zig-bee-accessory");
var EventType;
(function (EventType) {
    EventType[EventType["SINGLE"] = 0] = "SINGLE";
    EventType[EventType["DOUBLE"] = 1] = "DOUBLE";
    EventType[EventType["HOLD"] = 2] = "HOLD";
})(EventType = exports.EventType || (exports.EventType = {}));
class AqaraOppleSwitch extends zig_bee_accessory_1.ZigBeeAccessory {
    constructor() {
        super(...arguments);
        this.withBattery = false;
    }
    getAvailableServices() {
        const builder = new programmable_switch_service_builder_1.ProgrammableSwitchServiceBuilder(this.platform, this.accessory, this.client, this.state);
        this.buttons.forEach(button => {
            builder.withStatelessSwitch(button.displayName, button.subType, button.index, [
                EventType.SINGLE,
                EventType.DOUBLE,
                EventType.HOLD,
            ]);
        });
        this.services = builder.build();
        if (this.withBattery) {
            this.services.push(new battery_service_builder_1.BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
                .withBatteryPercentage()
                .build());
        }
        return this.services;
    }
    update(state) {
        super.update(state);
        const action = this.parseAction(this.state.action);
        if (action !== null) {
            const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
            action.switchService.getCharacteristic(ProgrammableSwitchEvent).setValue(action.eventType);
            delete this.state.action;
        }
    }
    // actionString eg. 'button_2_double' => button with index 2 with EventType DOUBLE
    parseAction(actionString) {
        if (actionString == undefined) {
            return null;
        }
        const actionComponents = actionString.split('_');
        if (actionComponents.length !== 3 || actionComponents[0] !== 'button') {
            return null;
        }
        // get index of switchService by checking if button.index matches the button index from action
        const switchServiceIndex = this.buttons.findIndex(button => button.index === parseInt(actionComponents[1]));
        // just to be sure probably not needed ¯\_(ツ)_/¯
        if (switchServiceIndex < 0) {
            return null;
        }
        const action = {
            switchService: this.services[switchServiceIndex],
            eventType: undefined,
        };
        switch (actionComponents[2]) {
            case 'single':
                action.eventType = EventType.SINGLE;
                break;
            case 'double':
                action.eventType = EventType.DOUBLE;
                break;
            case 'hold':
                action.eventType = EventType.HOLD;
                break;
            default:
                return null;
        }
        return action;
    }
}
class AqaraOppleSwitch2Buttons extends AqaraOppleSwitch {
    constructor(platform, accessory, client, device) {
        super(platform, accessory, client, device);
        this.withBattery = true;
        this.buttons = [
            {
                index: 1,
                displayName: 'button_1',
                subType: 'top_left',
            },
            {
                index: 2,
                displayName: 'button_2',
                subType: 'top_right',
            },
        ];
    }
}
exports.AqaraOppleSwitch2Buttons = AqaraOppleSwitch2Buttons;
class AqaraOppleSwitch4Buttons extends AqaraOppleSwitch {
    constructor(platform, accessory, client, device) {
        super(platform, accessory, client, device);
        this.withBattery = true;
        this.buttons = [
            {
                index: 3,
                displayName: 'button_1',
                subType: 'top_left',
            },
            {
                index: 4,
                displayName: 'button_2',
                subType: 'top_right',
            },
            {
                index: 1,
                displayName: 'button_3',
                subType: 'bottom_left',
            },
            {
                index: 2,
                displayName: 'button_4',
                subType: 'bottom_right',
            },
        ];
    }
}
exports.AqaraOppleSwitch4Buttons = AqaraOppleSwitch4Buttons;
class AqaraOppleSwitch6Buttons extends AqaraOppleSwitch {
    constructor(platform, accessory, client, device) {
        super(platform, accessory, client, device);
        this.withBattery = true;
        this.buttons = [
            {
                index: 3,
                displayName: 'middle left',
                subType: 'middle_left',
            },
            {
                index: 4,
                displayName: 'middle right',
                subType: 'middle_right',
            },
            {
                index: 5,
                displayName: 'bottom left',
                subType: 'bottom_left',
            },
            {
                index: 6,
                displayName: 'bottom right',
                subType: 'bottom_right',
            },
            {
                index: 1,
                displayName: 'top left',
                subType: 'top_left',
            },
            {
                index: 2,
                displayName: 'top right',
                subType: 'top_right',
            },
        ];
    }
}
exports.AqaraOppleSwitch6Buttons = AqaraOppleSwitch6Buttons;
//# sourceMappingURL=aqara-opple-switch.js.map