import { ZigBeeClient } from '../zigbee/zig-bee-client';
import {
  Callback,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  PlatformAccessory,
  Service,
} from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';
import { DeviceState } from '../zigbee/types';

export class HumiditySensorServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    this.service =
      this.accessory.getService(platform.Service.HumiditySensor) ||
      this.accessory.addService(platform.Service.HumiditySensor);
  }

  public withHumidity(): HumiditySensorServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          Object.assign(this.state, await this.client.getHumidity(this.device));
          callback(null, Math.round(this.state.humidity || 0));
        } catch (e) {
          callback(e);
        }
      });

    return this;
  }

  withBatteryLow() {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.StatusLowBattery)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        callback(
          null,
          this.state.battery_low
            ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        );
      });

    return this;
  }

  public build(): Service {
    return this.service;
  }
}
