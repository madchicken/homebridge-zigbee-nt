import { ZigBeeAccessory } from '../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../builders/lighbulb-service-builder';

export class PhilipsHueWhite extends ZigBeeAccessory {
  get name() { return 'HUE Bulb' };

  getAvailableServices() {
    const lightbulbService = new LighbulbServiceBuilder(this.platform, this.accessory, this.client)
      .withOnOff()
      .withBrightness()
      .build();
    return [lightbulbService];
  }
}
