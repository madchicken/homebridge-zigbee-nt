import { ZigBeeClient } from '../zigbee/zig-bee-client';
import {
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  PlatformAccessory,
  Service,
} from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';
import { DeviceState } from '../zigbee/types';

export class OutletServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    this.service =
      this.accessory.getService(platform.Service.Outlet) ||
      this.accessory.addService(platform.Service.Outlet);
  }

  public withOnOff(): OutletServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.On)
      .on(
        CharacteristicEventTypes.SET,
        async (on: boolean, callback: CharacteristicSetCallback) => {
          try {
            const status = await this.client.setOn(this.device, on);
            Object.assign(this.state, status);
            callback();
          } catch (e) {
            callback(e);
          }
        }
      );
    this.service
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          const state = await this.client.getOnOffState(this.device);
          callback(null, state.state === 'ON');
        } catch (e) {
          callback(e);
        }
      });

    return this;
  }

  public withPower(): OutletServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.OutletInUse)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          const state = await this.client.getPowerState(this.device);
          callback(null, state.power > 0);
        } catch (e) {
          callback(e);
        }
      });

    return this;
  }

  public withVoltage(): OutletServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.OutletInUse)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          const state = await this.client.getVoltageState(this.device);
          callback(null, state.voltage > 0);
        } catch (e) {
          callback(e);
        }
      });

    return this;
  }

  public withCurrent(): OutletServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.OutletInUse)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          const state = await this.client.getCurrentState(this.device);
          callback(null, state.current > 0);
        } catch (e) {
          callback(e);
        }
      });

    return this;
  }

  public build(): Service {
    return this.service;
  }
}
