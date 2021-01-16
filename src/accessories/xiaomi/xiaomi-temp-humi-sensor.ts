import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { TemperatureSensorServiceBuilder } from '../../builders/temperature-sensor-service-builder';
import { HumiditySensorServiceBuilder } from '../../builders/humidity-sensor-service-builder';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';

export class XiaomiTempHumiSensor extends ZigBeeAccessory {
  private temperatureService: Service;
  private humidityService: Service;
  private batteryService: Service;

  getAvailableServices() {
    this.temperatureService = new TemperatureSensorServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withTemperature()
      .build();

    this.humidityService = new HumiditySensorServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withHumidity()
      .build();

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryPercentage()
      .build();

    return [this.temperatureService, this.humidityService, this.batteryService];
  }
}
