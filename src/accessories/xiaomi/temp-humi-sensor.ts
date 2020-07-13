import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Callback, CharacteristicEventTypes, Service } from 'homebridge';
import { TemperatureSensorServiceBuilder } from '../../builders/temperature-sensor-service-builder';
import { HumiditySensorServiceBuilder } from '../../builders/humidity-sensor-service-builder';

export class TempHumiSensor extends ZigBeeAccessory {
  private temperatureService: Service;
  private humidityService: Service;
  private batteryService: Service;

  getAvailableServices() {
    const Characteristic = this.platform.Characteristic;
    this.temperatureService = new TemperatureSensorServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withTemperature()
      .andBattery()
      .build();
    this.humidityService = new HumiditySensorServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withHumidity()
      .andBattery()
      .build();

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
