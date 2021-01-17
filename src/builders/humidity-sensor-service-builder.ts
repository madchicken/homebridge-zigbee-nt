import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { CharacteristicEventTypes, CharacteristicGetCallback, PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState } from '../zigbee/types';
import { SensorServiceBuilder } from './sensor-service-builder';

export class HumiditySensorServiceBuilder extends SensorServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform.Service.HumiditySensor, platform, accessory, client, state);
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
}
