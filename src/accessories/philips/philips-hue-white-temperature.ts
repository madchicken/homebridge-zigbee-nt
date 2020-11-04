import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { PhilipsHueWhite } from './philips-hue-white';

export class PhilipsHueWhiteTemperature extends PhilipsHueWhite {
  getAvailableServices() {
    const lightbulbService = new LighbulbServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withOnOff()
      .withBrightness()
      .withColorTemperature()
      .build();
    return [lightbulbService];
  }
}
