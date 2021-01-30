import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { MotionSensorServiceBuilder } from '../../builders/motion-sensor-service-builder';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';

export class XiaomiMotionSensor extends ZigBeeAccessory {
  private sensorService: Service;
  private batteryService: Service;

  getAvailableServices(): Service[] {
    this.sensorService = new MotionSensorServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withOccupancy()
      .build();

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryPercentage()
      .build();

    return [this.sensorService, this.batteryService];
  }
}
