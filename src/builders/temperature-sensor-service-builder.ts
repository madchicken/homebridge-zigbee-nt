import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { Callback, CharacteristicEventTypes, PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';
import { DeviceState } from '../zigbee/types';

export class TemperatureSensorServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    this.service =
      this.accessory.getService(platform.Service.TemperatureSensor) ||
      this.accessory.addService(platform.Service.TemperatureSensor);
  }

  public withTemperature(): TemperatureSensorServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        try {
          Object.assign(this.state, await this.client.getTemperature(this.device));
          callback(null, this.state.temperature);
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
