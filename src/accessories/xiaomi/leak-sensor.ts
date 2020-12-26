import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Callback, CharacteristicEventTypes, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { DeviceState } from '../../zigbee/types';

export class XiaomiLeakSensor extends ZigBeeAccessory {
  private leakService: Service;

  getAvailableServices() {
    const Characteristic = this.platform.Characteristic;

    this.leakService =
      this.accessory.getService(this.platform.Service.LeakSensor) ||
      this.accessory.addService(this.platform.Service.LeakSensor);

    this.leakService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        this.log.debug(`XiaomiLeakSensor get State for ${this.accessory.displayName}`, this.state);

        const leakDetected = this.state.water_leak === true;
        callback(
          null,
          leakDetected
            ? Characteristic.LeakDetected.LEAK_DETECTED
            : Characteristic.LeakDetected.LEAK_NOT_DETECTED
        );
      });

    this.leakService
      .getCharacteristic(Characteristic.StatusLowBattery)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        this.log.debug(
          `XiaomiLeakSensor get StatusLowBattery for ${this.accessory.displayName}`,
          this.state
        );

        callback(
          null,
          this.state.battery_low === true
            ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        );
      });

    return [this.leakService];
  }

  update(device: Device, state: DeviceState) {
    const Characteristic = this.platform.Characteristic;
    super.update(device, state);

    const leakDetected = state.water_leak === true;
    this.leakService
      .getCharacteristic(Characteristic.ContactSensorState)
      .setValue(
        leakDetected
          ? Characteristic.LeakDetected.LEAK_DETECTED
          : Characteristic.LeakDetected.LEAK_NOT_DETECTED
      );

    this.leakService
      .getCharacteristic(Characteristic.BatteryLevel)
      .setValue(
        state.battery_low === true
          ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
          : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
      );
  }
}
