import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';
import { AmbientLightServiceBuilder } from '../../builders/ambient-light-service-builder';

export class XiaomiLightIntensitySensor extends ZigBeeAccessory {
  private ambientLightService: Service;
  private batteryService: Service;

  getAvailableServices() {
    this.ambientLightService = new AmbientLightServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withAmbientLightLevel()
      .build();

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryPercentage()
      .build();

    return [this.ambientLightService, this.batteryService];
  }
}
