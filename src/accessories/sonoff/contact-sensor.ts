import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service, CharacteristicEventTypes, Callback } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { DeviceState } from '../../zigbee/types';

export class SonoffContactSensor extends ZigBeeAccessory {
  private contactService: Service;
  private batteryService: Service;

  getAvailableServices() {
    const Characteristic = this.platform.Characteristic;

    this.contactService =
      this.accessory.getService(this.platform.Service.ContactSensor) ||
      this.accessory.addService(this.platform.Service.ContactSensor);

    this.contactService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        this.log.debug(
          `SonoffContactSensor get ContactSensorState for ${this.accessory.displayName}`,
          this.state
        );

        callback(
          null,
          this.state.contact
            ? Characteristic.ContactSensorState.CONTACT_DETECTED
            : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
        );
      });

    this.contactService
      .getCharacteristic(Characteristic.StatusLowBattery)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        this.log.debug(
          `SonoffContactSensor get StatusLowBattery for ${this.accessory.displayName}`,
          this.state
        );

        callback(
          null,
          this.state.battery && this.state.battery <= 10
            ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        );
      });

    this.batteryService =
      this.accessory.getService(this.platform.Service.BatteryService) ||
      this.accessory.addService(this.platform.Service.BatteryService);

    this.batteryService
      .getCharacteristic(Characteristic.BatteryLevel)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        this.log.debug(
          `SonoffContactSensor get BatteryLevel for ${this.accessory.displayName}`,
          this.state
        );

        callback(null, this.state.battery || 100);
      });

    return [this.contactService, this.batteryService];
  }

  update(device: Device, state: DeviceState) {
    const Characteristic = this.platform.Characteristic;
    this.log.debug(
      `SonoffContactSensor update ContactSensorState for ${this.accessory.displayName}`,
      this.state
    );

    super.update(device, state);
    this.contactService
      .getCharacteristic(Characteristic.ContactSensorState)
      .setValue(
        state.contact
          ? Characteristic.ContactSensorState.CONTACT_DETECTED
          : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
      );
  }
}
