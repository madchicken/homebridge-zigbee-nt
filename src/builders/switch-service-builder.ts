import { ServiceBuilder } from './service-builder';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import {
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  PlatformAccessory,
} from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { DeviceState } from '../zigbee/types';

export class SwitchServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    this.service =
      this.accessory.getService(platform.Service.Switch) ||
      this.accessory.addService(platform.Service.Switch);
  }

  public withOnOff(): SwitchServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.On)
      .on(
        CharacteristicEventTypes.SET,
        async (yes: boolean, callback: CharacteristicSetCallback) => {
          try {
            Object.assign(this.state, await this.client.setOn(this.device, yes));
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
          Object.assign(this.state, await this.client.getOnOffState(this.device));
          this.log.debug(`Reporting On for ${this.accessory.displayName}`, this.state);
          callback(null, this.state.state === 'ON');
        } catch (e) {
          callback(e);
        }
      });

    return this;
  }
}
