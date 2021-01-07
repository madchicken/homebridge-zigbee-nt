import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { IkeaTradfriDim } from './ikea-tradfri-dim';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';

export class IkeaTradfriDimColortemp extends IkeaTradfriDim {
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
      .withColorTemperature()
      .build();
    return [this.lightbulbService];
  }
}
