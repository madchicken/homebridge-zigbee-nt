import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { Callback, CharacteristicEventTypes, PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';
import { DeviceState } from '../zigbee/types';

export class ContactSensorServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    this.service =
      this.accessory.getService(platform.Service.ContactSensor) ||
      this.accessory.addService(platform.Service.ContactSensor);
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
