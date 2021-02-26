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

export class LockServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    this.service =
      this.accessory.getService(platform.Service.LockMechanism) ||
      this.accessory.addService(platform.Service.LockMechanism);
  }

  public withLockState(): LockServiceBuilder {
    const Characteristic = this.platform.Characteristic;
    this.state.state = 'LOCK';

    this.service
      .getCharacteristic(Characteristic.LockTargetState)
      .on(
        CharacteristicEventTypes.SET,
        async (yes: boolean, callback: CharacteristicSetCallback) => {
          try {
            Object.assign(this.state, await this.client.setLockState(this.device, yes));
            callback();
          } catch (e) {
            callback(e);
          }
        }
      );
    this.service
      .getCharacteristic(Characteristic.LockCurrentState)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        try {
          this.client.getLockState(this.device).catch(e => this.log.error(e.message));
          const locked: boolean = this.state.state === 'LOCK' || this.state.lock_state === 'locked';
          const notFullyLocked: boolean = this.state.lock_state === 'not_fully_locked';
          callback(
            null,
            locked
              ? Characteristic.LockCurrentState.SECURED
              : notFullyLocked
              ? Characteristic.LockCurrentState.JAMMED
              : Characteristic.LockCurrentState.UNSECURED
          );
        } catch (e) {
          callback(e);
        }
      });

    return this;
  }
}
