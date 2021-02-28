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
import { get } from 'lodash';

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
            const status = await this.client.setOnState(this.device, on);
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
        this.client.getOnOffState(this.device).catch(e => this.log.error(e.message));
        callback(null, get(this.state, 'state', 'OFF') === 'ON');
      });

    return this;
  }

  public withPower(): OutletServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.OutletInUse)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        this.client.getPowerState(this.device).catch(e => this.log.error(e.message));
        callback(null, get(this.state, 'power', 0) > 0);
      });

    return this;
  }

  public withVoltage(): OutletServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.OutletInUse)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        this.client.getVoltageState(this.device).catch(e => this.log.error(e.message));
        callback(null, get(this.state, 'voltage', 0) > 0);
      });

    return this;
  }

  public withCurrent(): OutletServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.OutletInUse)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        this.client.getCurrentState(this.device).catch(e => this.log.error(e.message));
        callback(null, get(this.state, 'current', 0) > 0);
      });

    return this;
  }

  public build(): Service {
    return this.service;
  }
}
