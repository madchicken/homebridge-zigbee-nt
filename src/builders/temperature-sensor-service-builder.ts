import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { CharacteristicGetCallback, CharacteristicEventTypes, PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState } from '../zigbee/types';
import { SensorServiceBuilder } from './sensor-service-builder';

export class TemperatureSensorServiceBuilder extends SensorServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform.Service.TemperatureSensor, platform, accessory, client, state);
  }

  public withTemperature(): TemperatureSensorServiceBuilder {
    const Characteristic = this.platform.Characteristic;
    this.state.temperature = 0;

    this.service
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        callback(null, this.state.temperature);
      });

    return this;
  }
}
