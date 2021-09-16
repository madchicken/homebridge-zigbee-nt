import { Service } from 'homebridge';
import { ThermostatServiceBuilder } from '../../builders/thermostat-service-builder';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';
import { DeviceState } from '../../zigbee/types';
import { ZigBeeAccessory } from '../zig-bee-accessory';
import { HAP } from '../../index';

export class TuyaThermostatControl extends ZigBeeAccessory {
  protected thermostatService: Service;
  protected batteryService: Service;

  getAvailableServices(): Service[] {
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

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryLowStatus()
      .build();
    return [this.thermostatService, this.batteryService];
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
    if (typeof state.position === 'number') {
      if (state.position > 0)
        this.thermostatService.updateCharacteristic(
          this.platform.Characteristic.CurrentHeatingCoolingState,
          HAP.Characteristic.CurrentHeatingCoolingState.HEAT
        );
      else
        this.thermostatService.updateCharacteristic(
          this.platform.Characteristic.CurrentHeatingCoolingState,
          HAP.Characteristic.CurrentHeatingCoolingState.OFF
        );
    }
  }
}
