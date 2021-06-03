"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceType = void 0;
/**
 * Supported services for manually configured devices
 */
var ServiceType;
(function (ServiceType) {
    ServiceType["UNKNOWN"] = "unknown";
    ServiceType["CONTACT_SENSOR"] = "contact-sensor";
    ServiceType["LIGHT_SENSOR"] = "light-sensor";
    ServiceType["BULB"] = "bulb";
    ServiceType["LIGHT_BULB"] = "light-bulb";
    ServiceType["SWITCH"] = "switch";
    ServiceType["PROGRAMMABLE_SWITCH"] = "programmable-switch";
    ServiceType["MOTION_SENSOR"] = "motion-sensor";
    ServiceType["LEAK_SENSOR"] = "leak-sensor";
    ServiceType["VIBRATION_SENSOR"] = "vibration-sensor";
    ServiceType["BATTERY"] = "battery";
    ServiceType["HUMIDITY_SENSOR"] = "humidity-sensor";
    ServiceType["TEMPERATURE_SENSOR"] = "temperature-sensor";
    ServiceType["OUTLET"] = "outlet";
    ServiceType["LOCK"] = "lock";
    ServiceType["THERMOSTAT"] = "thermostat";
    ServiceType["COVER"] = "cover";
})(ServiceType = exports.ServiceType || (exports.ServiceType = {}));
;
//# sourceMappingURL=types.js.map