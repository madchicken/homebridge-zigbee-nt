import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Callback, CharacteristicEventTypes, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { DeviceState } from '../../zigbee/types';

export class LinkindMotionSensor extends ZigBeeAccessory {
  private sensorService: Service;

  getAvailableServices(): Service[] {
    const Service = this.platform.api.hap.Service;
    const Characteristic = this.platform.api.hap.Characteristic;

    this.sensorService =
      this.accessory.getService(Service.OccupancySensor) ||
      this.accessory.addService(Service.OccupancySensor);
    this.sensorService.setCharacteristic(Characteristic.Name, this.name);
    this.sensorService
      .getCharacteristic(Characteristic.OccupancyDetected)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        if (this.state.contact) {
          this.log.debug(`Motion detected for sensor ${this.name}`);
        }
        callback(
          null,
          this.state.occupancy
            ? Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
            : Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED
        );
      });

    this.sensorService
      .getCharacteristic(Characteristic.StatusLowBattery)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        callback(
          null,
          this.state.battery_low
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
      this.platform.Characteristic.OccupancyDetected,
      state.occupancy
        ? Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
        : Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED
    );

    this.sensorService.updateCharacteristic(
      this.platform.Characteristic.StatusLowBattery,
      state.battery_low
        ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
        : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
    );
  }
}
