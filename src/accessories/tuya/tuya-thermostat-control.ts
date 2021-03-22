import { Service } from 'homebridge';
import { ThermostatServiceBuilder } from '../../builders/thermostat-service-builder';
import { DeviceState } from '../../zigbee/types';
import { ZigBeeAccessory } from '../zig-bee-accessory';

export class TuyaThermostatControl extends ZigBeeAccessory {
  private thermostatService: Service;

  getAvailableServices() {
    this.thermostatService = new ThermostatServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withCurrentHeatingCoolingState()
      .withTargetHeatingCoolingState(['auto'], ['cool'])
      .withCurrentTemperature()
      .withTargetTemperature(5, 35)
      .build();
    return [this.thermostatService];
  }

  update(state: DeviceState) {
    super.update(state);
    if (typeof state.local_temperature === 'number') {
      this.thermostatService.updateCharacteristic(
        this.platform.Characteristic.CurrentTemperature,
        state.local_temperature
      );
    }
    if (typeof state.current_heating_setpoint === 'number') {
      this.thermostatService.updateCharacteristic(
        this.platform.Characteristic.TargetTemperature,
        state.current_heating_setpoint
      );
    }
  }
}
