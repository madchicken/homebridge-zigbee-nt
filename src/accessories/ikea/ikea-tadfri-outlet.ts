import { ZigBeeAccessory } from '../../zig-bee-accessory';
import { OutletServiceBuilder } from '../../builders/outlet-service-builder';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { ZigBeeClient } from '../../zig-bee-client';
import { ZigBeeDevice } from '../../zigbee';

export class IkeaTadfriOutlet extends ZigBeeAccessory {
  private service: Service;
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: ZigBeeDevice
  ) {
    super(platform, accessory, client, device);
  }

  getAvailableServices() {
    this.service = new OutletServiceBuilder(this.platform, this.accessory, this.client, this.state)
      .withOnOff()
      .build();
    return [this.service];
  }

  protected async updateDevice() {
    const state = await this.client.getOnOffState(this.zigBeeDeviceDescriptor);
    this.service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
  }
}
