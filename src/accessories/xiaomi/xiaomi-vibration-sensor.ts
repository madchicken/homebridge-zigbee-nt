import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Callback, CharacteristicEventTypes, Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';

export class XiaomiVibrationSensor extends ZigBeeAccessory {
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
          `XiaomiVibrationSensor get Vibration Sensor State for ${this.accessory.displayName}`,
          this.state
        );

        const vibrationDetected = this.state.strength || this.state.action;
        callback(
          null,
          vibrationDetected
            ? Characteristic.ContactSensorState.CONTACT_DETECTED
            : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
        );
      });

    const supportedServices = [this.contactService];
    if (this.supports('battery')) {
      this.batteryService = new BatteryServiceBuilder(
        this.platform,
        this.accessory,
        this.client,
        this.state
      )
        .withBatteryPercentage()
        .build();

      supportedServices.push(this.batteryService);
    }

    return supportedServices;
  }

  update(state: DeviceState) {
    const Characteristic = this.platform.Characteristic;
    const vibrationDetected = state.strength || state.action;
    this.contactService
      .getCharacteristic(Characteristic.ContactSensorState)
      .setValue(
        vibrationDetected
          ? Characteristic.ContactSensorState.CONTACT_DETECTED
          : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
      );
    this.batteryService.updateCharacteristic(Characteristic.BatteryLevel, state.battery || 0);
    this.batteryService.updateCharacteristic(
      Characteristic.StatusLowBattery,
      state.battery && state.battery < 10
    );
  }
}
