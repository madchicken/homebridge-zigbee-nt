import { Service } from 'homebridge';
import { ContactSensorServiceBuilder } from '../../builders/contact-sensor-service-builder';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';
import { ZigBeeAccessory } from '../zig-bee-accessory';

export class SonoffContactSensor extends ZigBeeAccessory {
  private contactService: Service;
  private batteryService: Service;

  getAvailableServices() {
    this.contactService = new ContactSensorServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withContact()
      .build();

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryPercentage()
      .build();

    return [this.contactService, this.batteryService];
  }
}
