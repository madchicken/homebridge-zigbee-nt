"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCustomCharacteristics = exports.HAP = exports.HomebridgeAPI = void 0;
const fakegato_history_1 = __importDefault(require("fakegato-history"));
const devices_registration_1 = require("./devices-registration");
const platform_1 = require("./platform");
const settings_1 = require("./settings");
exports.HAP = {
    Service: null,
    Characteristic: null,
    PlatformAccessory: null,
    CurrentPowerConsumption: null,
    TotalConsumption: null,
    CurrentVoltage: null,
    CurrentConsumption: null,
    FakeGatoHistoryService: null,
};
function initCustomCharacteristics(homebridge) {
    var _a, _b, _c, _d;
    exports.HAP.Service = homebridge.hap.Service;
    exports.HAP.Characteristic = homebridge.hap.Characteristic;
    exports.HAP.PlatformAccessory = homebridge.platformAccessory;
    exports.HAP.FakeGatoHistoryService = fakegato_history_1.default(homebridge);
    exports.HAP.CurrentPowerConsumption = (_a = class CurrentPowerConsumption extends exports.HAP.Characteristic {
            constructor() {
                super('CurrentConsumption', CurrentPowerConsumption.UUID, {
                    format: "uint16" /* UINT16 */,
                    unit: 'watts',
                    maxValue: 100000,
                    minValue: 0,
                    minStep: 1,
                    perms: ["pr" /* PAIRED_READ */, "ev" /* NOTIFY */],
                });
            }
        },
        _a.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52',
        _a);
    exports.HAP.CurrentVoltage = (_b = class CurrentVoltage extends exports.HAP.Characteristic {
            constructor() {
                super('CurrentVoltage', CurrentVoltage.UUID, {
                    format: "uint16" /* UINT16 */,
                    unit: 'volts',
                    maxValue: 1000,
                    minValue: 0,
                    minStep: 1,
                    perms: ["pr" /* PAIRED_READ */, "ev" /* NOTIFY */],
                });
            }
        },
        _b.UUID = 'E863F10A-079E-48FF-8F27-9C2605A29F52',
        _b);
    exports.HAP.CurrentConsumption = (_c = class CurrentConsumption extends exports.HAP.Characteristic {
            constructor() {
                super('CurrentConsumption', CurrentConsumption.UUID, {
                    format: "uint16" /* UINT16 */,
                    unit: 'ampere',
                    maxValue: 1000,
                    minValue: 0,
                    minStep: 1,
                    perms: ["pr" /* PAIRED_READ */, "ev" /* NOTIFY */],
                });
            }
        },
        _c.UUID = 'E863F126-079E-48FF-8F27-9C2605A29F52',
        _c);
    exports.HAP.TotalConsumption = (_d = class TotalConsumption extends exports.HAP.Characteristic {
            constructor() {
                super('TotalConsumption', TotalConsumption.UUID, {
                    format: "float" /* FLOAT */,
                    unit: 'kWh',
                    minValue: 0,
                    minStep: 0.001,
                    perms: ["pr" /* PAIRED_READ */, "ev" /* NOTIFY */],
                });
            }
        },
        _d.UUID = 'E863F10C-079E-48FF-8F27-9C2605A29F52',
        _d);
}
exports.initCustomCharacteristics = initCustomCharacteristics;
/**
 * This method registers the platform with Homebridge
 */
function default_1(homebridge) {
    exports.HomebridgeAPI = homebridge;
    initCustomCharacteristics(homebridge);
    devices_registration_1.registerSupportedDevices();
    homebridge.registerPlatform(settings_1.PLUGIN_IDENTIFIER, settings_1.PLATFORM_NAME, platform_1.ZigbeeNTHomebridgePlatform);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map