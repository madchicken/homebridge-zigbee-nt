import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Callback, CharacteristicEventTypes, Service } from 'homebridge';

export class TempHumiSensor extends ZigBeeAccessory {
  private temperatureService: Service;
  private humidityService: Service;
  private batteryService: Service;

  getAvailableServices() {
    const Characteristic = this.platform.Characteristic;
    this.temperatureService =
      this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.temperatureService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        callback(null, this.state.temperature);
      });

    this.humidityService =
      this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);

    this.humidityService
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        callback(null, this.state.humidity);
      });

    this.batteryService =
      this.accessory.getService(this.platform.Service.BatteryService) ||
      this.accessory.addService(this.platform.Service.BatteryService);

    this.batteryService
      .getCharacteristic(Characteristic.BatteryLevel)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        callback(null, this.state.battery);
      });

    return [this.temperatureService, this.humidityService, this.batteryService];
  }
}
