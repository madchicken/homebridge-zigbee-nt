import { ZigBeeAccessory } from '../../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { ActionType } from '../../zig-bee-client';

export class PhilipsHueWhiteAndColor extends ZigBeeAccessory {
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

  async handleAccessoryIdentify() {
    await this.client.sendMessage(
      this.zigBeeDeviceDescriptor,
      ActionType.set,
      {
        alert: 'select',
      },
      this.state
    );
  }
}
