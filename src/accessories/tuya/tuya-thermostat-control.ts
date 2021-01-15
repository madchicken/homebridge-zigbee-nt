import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { ThermostatServiceBuilder } from '../../builders/thermostat-service-builder';

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
    this.thermostatService.updateCharacteristic(
      this.platform.Characteristic.CurrentTemperature,
      state.local_temperature
    );
    this.thermostatService.updateCharacteristic(
      this.platform.Characteristic.TargetTemperature,
      state.current_heating_setpoint
    );
  }
}
