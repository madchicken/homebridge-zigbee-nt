import { ZigBeeAccessory } from '../../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { ActionType } from '../../zig-bee-client';
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
      .withHue()
      .withBrightness()
      .withColorTemperature()
      .withSaturation()
      .build();
    return [lightbulbService];
  }

  protected async updateDevice(): Promise<void> {
    await super.updateDevice();
    const saturation = await this.client.getSaturation(this.zigBeeDeviceDescriptor);
  }
}
