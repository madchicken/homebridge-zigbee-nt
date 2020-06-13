import { ZigBeeAccessory } from '../../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';

export class PhilipsHueWhite extends ZigBeeAccessory {
  getAvailableServices() {
    const lightbulbService = new LighbulbServiceBuilder(this.platform, this.accessory, this.client)
      .withOnOff()
      .withBrightness()
      .build();
    return [lightbulbService];
  }
}
