import { ZigBeeAccessory } from '../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { Service } from 'homebridge';

export class NanoleafIvy extends ZigBeeAccessory {
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
      .build();
    return [this.lightbulbService];
  }

  async handleAccessoryIdentify() {
    await this.client.identify(this.zigBeeDeviceDescriptor);
  }
}
