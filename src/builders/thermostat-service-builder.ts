import { ZigBeeClient } from '../zigbee/zig-bee-client';
import {
  Callback,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  PlatformAccessory,
} from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';
import { DeviceState, SystemMode } from '../zigbee/types';

export class ThermostatServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);

    this.service =
      this.accessory.getService(platform.Service.Thermostat) ||
      this.accessory.addService(platform.Service.Thermostat);
  }

  public withCurrentHeatingCoolingState(): ThermostatServiceBuilder {
    const Characteristic = this.platform.Characteristic;
    this.service
      .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          callback(null, this.translateFromSystemMode(this.state.system_mode));
        } catch (e) {
          callback(e);
        }
      });

    return this;
  }

  public withTargetHeatingCoolingState(
    asAuto?: [SystemMode],
    asOff?: [SystemMode]
  ): ThermostatServiceBuilder {
    const Characteristic = this.platform.Characteristic;
    this.service
      .getCharacteristic(Characteristic.TargetHeatingCoolingState)
      .on(
        CharacteristicEventTypes.SET,
        async (system_mode: number, callback: CharacteristicSetCallback) => {
          let translatedMode: SystemMode = this.translateToSystemMode(system_mode);
          if (
            asAuto &&
            Array.isArray(asAuto) &&
            asAuto.length > 0 &&
            asAuto.includes(translatedMode)
          ) {
            translatedMode = 'auto';
          }
          if (asOff && Array.isArray(asOff) && asOff.length > 0 && asOff.includes(translatedMode)) {
            translatedMode = 'off';
          }
          try {
            Object.assign(this.state, await this.client.setSystemMode(this.device, translatedMode));
            callback();
          } catch (e) {
            callback(e);
          }
        }
      );
    this.service
      .getCharacteristic(Characteristic.TargetHeatingCoolingState)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          callback(null, this.translateFromSystemMode(this.state.system_mode));
        } catch (e) {
          callback(e);
        }
      });
    return this;
  }

  public withCurrentTemperature(): ThermostatServiceBuilder {
    const Characteristic = this.platform.Characteristic;
    this.service
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        callback(null, this.state.local_temperature);
      });
    return this;
  }

  public withTargetTemperature(min: number, max: number): ThermostatServiceBuilder {
    const Characteristic = this.platform.Characteristic;
    this.service
      .getCharacteristic(Characteristic.TargetTemperature)
      .on(
        CharacteristicEventTypes.SET,
        async (current_heating_setpoint: number, callback: CharacteristicSetCallback) => {
          if (current_heating_setpoint < min) {
            current_heating_setpoint = min;
          }
          if (current_heating_setpoint > max) {
            current_heating_setpoint = max;
          }
          try {
            Object.assign(
              this.state,
              await this.client.setCurrentHeatingSetpoint(this.device, current_heating_setpoint)
            );
            callback();
          } catch (e) {
            callback(e);
          }
        }
      );
    this.service
      .getCharacteristic(Characteristic.TargetTemperature)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        callback(null, this.state.current_heating_setpoint);
      });
    return this;
  }

  public translateFromSystemMode(val: SystemMode): number {
    let result: number;
    switch (val) {
      case 'heat':
        result = 1;
        break;
      case 'cool':
        result = 2;
        break;
      case 'auto':
        result = 3;
        break;
      default:
        result = 0;
        break;
    }
    this.log.info('translateFromSystemMode(' + val + '): ' + result);
    return result;
  }

  public translateToSystemMode(val: number): SystemMode {
    let result: SystemMode;
    switch (val) {
      case 1:
        result = 'heat';
        break;
      case 2:
        result = 'cool';
        break;
      case 3:
        result = 'auto';
        break;
      default:
        result = 'off';
        break;
    }
    this.log.info('translateToSystemMode(' + val + '): ' + result);
    return result;
  }
}
