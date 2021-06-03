"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuyaThermostatControl = void 0;
const thermostat_service_builder_1 = require("../../builders/thermostat-service-builder");
const zig_bee_accessory_1 = require("../zig-bee-accessory");
class TuyaThermostatControl extends zig_bee_accessory_1.ZigBeeAccessory {
    getAvailableServices() {
        this.thermostatService = new thermostat_service_builder_1.ThermostatServiceBuilder(this.platform, this.accessory, this.client, this.state)
            .withCurrentHeatingCoolingState()
            .withTargetHeatingCoolingState(['auto'], ['cool'])
            .withCurrentTemperature()
            .withTargetTemperature(5, 35)
            .build();
        return [this.thermostatService];
    }
    update(state) {
        super.update(state);
        if (typeof state.local_temperature === 'number') {
            this.thermostatService.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, state.local_temperature);
        }
        if (typeof state.current_heating_setpoint === 'number') {
            this.thermostatService.updateCharacteristic(this.platform.Characteristic.TargetTemperature, state.current_heating_setpoint);
        }
    }
}
exports.TuyaThermostatControl = TuyaThermostatControl;
//# sourceMappingURL=tuya-thermostat-control.js.map