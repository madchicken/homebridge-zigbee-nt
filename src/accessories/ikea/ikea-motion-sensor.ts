import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Callback, CharacteristicEventTypes, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { DeviceState } from '../../zigbee/types';

export class IkeaMotionSensor extends ZigBeeAccessory {
  private sensorService: Service;

  getAvailableServices(): Service[] {
    const Service = this.platform.api.hap.Service;
    const Characteristic = this.platform.api.hap.Characteristic;

    this.sensorService =
      this.accessory.getService(Service.MotionSensor) ||
      this.accessory.addService(Service.MotionSensor);
    this.sensorService.setCharacteristic(Characteristic.Name, this.name);
    this.sensorService
      .getCharacteristic(Characteristic.MotionDetected)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        if (this.state.occupancy) {
          this.log.debug(`Motion detected for sensor ${this.name}`);
        }
        callback(null, this.state.occupancy);
      });

    this.sensorService
      .getCharacteristic(Characteristic.StatusLowBattery)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        callback(
          null,
          this.state.battery && this.state.battery <= 10
            ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        );
      });

    return [this.sensorService];
  }

  update(device: Device, state: DeviceState) {
    super.update(device, state);

    const Characteristic = this.platform.api.hap.Characteristic;
    this.sensorService.updateCharacteristic(
      this.platform.Characteristic.MotionDetected,
      state.contact
    );
    this.sensorService.updateCharacteristic(
      this.platform.Characteristic.StatusLowBattery,
      state.battery && state.battery <= 10
        ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
        : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
    );
  }
}
