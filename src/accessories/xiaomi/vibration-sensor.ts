import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Callback, CharacteristicEventTypes, CharacteristicGetCallback, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { DeviceState } from '../../zigbee/types';

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
    if (this.entity.definition.supports.includes('battery')) {
      this.contactService
        .getCharacteristic(Characteristic.StatusLowBattery)
        .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
          this.log.debug(
            `XiaomiVibrationSensor get StatusLowBattery for ${this.accessory.displayName}`,
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
        .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
          this.log.debug(
            `XiaomiVibrationSensor get BatteryLevel for ${this.accessory.displayName}`,
            this.state
          );

          callback(null, this.state.battery || 100);
        });

      supportedServices.push(this.batteryService);
    }

    return supportedServices;
  }

  update(device: Device, state: DeviceState) {
    const Characteristic = this.platform.Characteristic;
    this.log.debug(
      `XiaomiVibrationSensor update state for ${this.accessory.displayName}`,
      this.state
    );

    const vibrationDetected = state.strength || state.action;
    super.update(device, state);
    this.contactService
      .getCharacteristic(Characteristic.ContactSensorState)
      .setValue(
        vibrationDetected
          ? Characteristic.ContactSensorState.CONTACT_DETECTED
          : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
      );

    if (this.entity.definition.supports.includes('battery')) {
      this.batteryService
        .getCharacteristic(Characteristic.BatteryLevel)
        .setValue(this.state.battery);
    }
  }
}
