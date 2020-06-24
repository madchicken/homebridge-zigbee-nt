import { JsonPayload, ZigBeeClient } from '../zig-bee-client';
import { Callback, CharacteristicEventTypes, PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';

export class OutletServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: JsonPayload
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
      .on(CharacteristicEventTypes.SET, async (on: boolean, callback: Callback) => {
        try {
          const status = await this.client.setOn(this.device, on);
          Object.assign(this.state, status);
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const state = await this.client.getOnOffState(this.device);
        callback(null, state.state === 'ON');
      });

    return this;
  }

  public build(): Service {
    return this.service;
  }
}
