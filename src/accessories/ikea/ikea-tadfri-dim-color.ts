import { ZigBeeAccessory } from '../../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';

export class IkeaTadfriDimColor extends ZigBeeAccessory {
  getAvailableServices() {
    const lightbulbService = new LighbulbServiceBuilder(this.platform, this.accessory, this.client)
      .withOnOff()
      .withBrightness()
      .withSaturation()
      .build();
    return [lightbulbService];
  }

  onDeviceMount() {
    const color = this.client.getColorCapabilities(this.accessory.context);
    this.log.info(`Re-read color capabilities for ${this.accessory.displayName}`, color);
  }
}
