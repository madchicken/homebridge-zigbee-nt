import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { IkeaTadfriDim } from './ikea-tadfri-dim';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from '../../zig-bee-client';
import { ZigBeeDevice } from '../../zigbee';

export class IkeaTadfriDimColor extends IkeaTadfriDim {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: ZigBeeDevice
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
    super.onDeviceMount();
    const color = await this.client.getColorCapabilities(this.zigBeeDeviceDescriptor);
    this.log.info(`Re-read color capabilities for ${this.accessory.displayName}`, color);
  }
}
