import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { PhilipsHueWhite } from './philips-hue-white';

export class PhilipsHueWhiteAndColor extends PhilipsHueWhite {
  getAvailableServices() {
    const lightbulbService = new LighbulbServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withOnOff()
      .withColorXY()
      .withBrightness()
      .withColorTemperature()
      .build();
    return [lightbulbService];
  }
}
