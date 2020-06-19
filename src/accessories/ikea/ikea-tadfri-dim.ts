import { ZigBeeAccessory } from '../../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';

export class IkeaTadfriDim extends ZigBeeAccessory {
  getAvailableServices() {
    const lightbulbService = new LighbulbServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withOnOff()
      .withBrightness()
      .build();
    return [lightbulbService];
  }
}
