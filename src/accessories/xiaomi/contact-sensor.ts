import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service, CharacteristicEventTypes, Callback } from 'homebridge';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';

export class XiaomiContactSensor extends ZigBeeAccessory {
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
        callback(
          null,
          this.state.contact
            ? Characteristic.ContactSensorState.CONTACT_DETECTED
            : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
        );
      });

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBattery()
      .andLowBattery()
      .build();

    return [this.contactService, this.batteryService];
  }
}
