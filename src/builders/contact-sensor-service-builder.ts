import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { Callback, CharacteristicEventTypes, PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState } from '../zigbee/types';
import { SensorServiceBuilder } from './sensor-service-builder';

export class ContactSensorServiceBuilder extends SensorServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform.Service.ContactSensor, platform, accessory, client, state);
  }

  public withContact(): ContactSensorServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.ContactSensorState)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        callback(
          null,
          this.state.contact
            ? Characteristic.ContactSensorState.CONTACT_DETECTED
            : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
        );
      });

    return this;
  }
}
