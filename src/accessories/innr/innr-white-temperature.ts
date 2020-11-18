import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { InnrWhite } from './innr-white';

export class InnrWhiteTemperature extends InnrWhite {
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
