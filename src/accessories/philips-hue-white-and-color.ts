import { ZigBeeAccessory } from '../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../builders/lighbulb-service-builder';

export class PhilipsHueWhiteAndColor extends ZigBeeAccessory {
  get name() { return 'Philips Hue white and color ambiance' };

  getAvailableServices() {
    const lightbulbService = new LighbulbServiceBuilder(this.platform, this.accessory, this.client)
      .withOnOff()
      .withHue()
      .withBrightness()
      .withColorTemperature()
      .withSaturation()
      .build();
    return [lightbulbService];
  }
}
