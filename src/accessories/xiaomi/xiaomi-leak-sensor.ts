import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';
import { LeakSensorServiceBuilder } from '../../builders/leak-sensor-service-builder';

export class XiaomiLeakSensor extends ZigBeeAccessory {
  private leakService: Service;
  private batteryService: Service;

  getAvailableServices() {
    this.leakService = new LeakSensorServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withWaterLeak()
      .build();

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryPercentage()
      .build();

    return [this.leakService, this.batteryService];
  }
}
