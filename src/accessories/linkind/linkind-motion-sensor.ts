import { ZigBeeAccessory } from '../zig-bee-accessory';
import { CharacteristicGetCallback, CharacteristicEventTypes, Service } from 'homebridge';

export class LinkindMotionSensor extends ZigBeeAccessory {
  private sensorService: Service;

  getAvailableServices(): Service[] {
    const Service = this.platform.api.hap.Service;
    const Characteristic = this.platform.api.hap.Characteristic;

    this.sensorService =
      this.accessory.getService(Service.OccupancySensor) ||
      this.accessory.addService(Service.OccupancySensor);
    this.sensorService.setCharacteristic(Characteristic.Name, this.friendlyName);
    this.sensorService
      .getCharacteristic(Characteristic.OccupancyDetected)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        if (this.state.contact) {
          this.log.debug(`Motion detected for sensor ${this.friendlyName}`);
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
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        callback(
          null,
          this.state.battery_low
            ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        );
      });

    return [this.sensorService];
  }
}
