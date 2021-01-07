import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { IkeaTradfriDim } from './ikea-tradfri-dim';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';

export class IkeaTradfriDimColor extends IkeaTradfriDim {
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
