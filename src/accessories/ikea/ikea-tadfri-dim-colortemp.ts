import { ZigBeeAccessory } from '../../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';

export class IkeaTadfriDimColortemp extends ZigBeeAccessory {
  getAvailableServices() {
    const lightbulbService = new LighbulbServiceBuilder(this.platform, this.accessory, this.client)
      .withOnOff()
      .withBrightness()
      .withColorTemperature()
      .build();
    return [lightbulbService];
  }
}
