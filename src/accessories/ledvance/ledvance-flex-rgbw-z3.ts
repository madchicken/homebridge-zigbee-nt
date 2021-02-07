import { ZigBeeAccessory } from '../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { Service } from 'homebridge';

export class LedvanceFlexRgbwZ3 extends ZigBeeAccessory {
  protected lightbulbService: Service;

  getAvailableServices() {
    this.lightbulbService = new LighbulbServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withOnOff()
      .withBrightness()
      .withColorXY()
      .build();
    return [this.lightbulbService];
  }

  async onDeviceMount() {
    await super.onDeviceMount();
    const color = await this.client.getColorCapabilities(this.zigBeeDeviceDescriptor);
    this.log.info(`Re-read color capabilities for ${this.name}`, color);
  }
}
