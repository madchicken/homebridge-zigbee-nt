import {
  Callback,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  PlatformAccessory,
} from 'homebridge';
import { HAP } from '../index';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState, RunningState, SystemMode } from '../zigbee/types';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { ServiceBuilder } from './service-builder';

export function runningStateToCurrentHeatingCoolingState(val: RunningState): number {
  switch (val) {
    case 'heat':
      return HAP.Characteristic.CurrentHeatingCoolingState.HEAT;
    case 'cool':
      return HAP.Characteristic.CurrentHeatingCoolingState.COOL;
    case 'idle':
    default:
      return HAP.Characteristic.CurrentHeatingCoolingState.OFF;
  }
}

export function translateCurrentStateFromSystemMode(val: SystemMode): number {
  switch (val) {
    case 'heat':
      return HAP.Characteristic.CurrentHeatingCoolingState.HEAT;
    case 'cool':
      return HAP.Characteristic.CurrentHeatingCoolingState.COOL;
    default:
      return HAP.Characteristic.CurrentHeatingCoolingState.OFF;
  }
}

export function translateTargetStateFromSystemMode(val: SystemMode): number {
  switch (val) {
    case 'heat':
      return HAP.Characteristic.TargetHeatingCoolingState.HEAT;
    case 'cool':
      return HAP.Characteristic.TargetHeatingCoolingState.COOL;
    case 'auto':
      return HAP.Characteristic.TargetHeatingCoolingState.AUTO;
    default:
      return HAP.Characteristic.TargetHeatingCoolingState.OFF;
  }
}

export function translateTargetStateToSystemMode(val: number): SystemMode {
  switch (val) {
    case HAP.Characteristic.TargetHeatingCoolingState.HEAT:
      return 'heat';
    case HAP.Characteristic.TargetHeatingCoolingState.COOL:
      return 'cool';
    case HAP.Characteristic.TargetHeatingCoolingState.AUTO:
      return 'auto';
    default:
      return 'off';
  }
}

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
          callback(null, translateCurrentStateFromSystemMode(this.state.system_mode));
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
        async (state: number, callback: CharacteristicSetCallback) => {
          let translatedMode: SystemMode = translateTargetStateToSystemMode(state);
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
          callback(null, translateTargetStateFromSystemMode(this.state.system_mode));
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
    const temperatureFixer = getTemperatureFixer(min, max);
    this.service
      .getCharacteristic(Characteristic.TargetTemperature)
      .on(
        CharacteristicEventTypes.SET,
        async (targetTemp: number, callback: CharacteristicSetCallback) => {
          const temperature = temperatureFixer(targetTemp);
          try {
            Object.assign(
              this.state,
              await this.client.setCurrentHeatingSetpoint(this.device, temperature)
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
        callback(null, temperatureFixer(this.state.current_heating_setpoint));
      });
    return this;
  }
}

export const MIN_TEMP = 10;
export const MAX_TEMP = 38;

export function getTemperatureFixer(min: number, max: number): (temp: number) => number {
  const minTemp = Math.max(min, MIN_TEMP); // 10 is the minimum accepted by HK
  const maxTemp = Math.min(max, MAX_TEMP); // 38 is the maximum accepted by HK
  return (targetTemp: number) => Math.min(Math.max(targetTemp || MIN_TEMP, minTemp), maxTemp);
}
