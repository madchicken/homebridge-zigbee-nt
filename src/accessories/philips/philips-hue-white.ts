import { ZigBeeAccessory } from '../../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { Service } from 'homebridge';
import { ActionType } from '../../zig-bee-client';

export class PhilipsHueWhite extends ZigBeeAccessory {
  private lightbulbService: Service;
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
