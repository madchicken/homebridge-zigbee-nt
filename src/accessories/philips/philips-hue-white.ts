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

  protected async updateDevice() {
    const state = await this.client.getOnOffState(this.zigBeeDeviceDescriptor);
    this.lightbulbService.updateCharacteristic(
      this.platform.Characteristic.On,
      state.state === 'ON'
    );

    const brightness = await this.client.getBrightnessPercent(this.zigBeeDeviceDescriptor);
    this.lightbulbService.updateCharacteristic(
      this.platform.Characteristic.Brightness,
      brightness.brightness_percent
    );
  }
}
