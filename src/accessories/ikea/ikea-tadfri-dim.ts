import { ZigBeeAccessory } from '../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { Device } from 'zigbee-herdsman/dist/controller/model';

export class IkeaTadfriDim extends ZigBeeAccessory {
  protected lightbulbService: Service;

  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device
  ) {
    super(platform, accessory, client, device);
  }

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
