import { ServiceBuilder } from './service-builder';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { Callback, CharacteristicEventTypes, PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { DeviceState } from '../zigbee/types';

export class AmbientLightServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    this.service =
      this.accessory.getService(this.platform.Service.LightSensor) ||
      this.accessory.addService(this.platform.Service.LightSensor);
  }

  public withAmbientLightLevel(): AmbientLightServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        callback(null, this.state.illuminance_lux);
      });

    return this;
  }
}
