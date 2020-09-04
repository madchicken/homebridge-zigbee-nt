import { ZigBeeAccessory } from '../zig-bee-accessory';
import { OutletServiceBuilder } from '../../builders/outlet-service-builder';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { DeviceState } from '../../zigbee/types';

export class XiaomiOutlet extends ZigBeeAccessory {
  private service: Service;
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device
  ) {
    super(platform, accessory, client, device);
  }

  getAvailableServices() {
    this.service = new OutletServiceBuilder(this.platform, this.accessory, this.client, this.state)
      .withOnOff()
      .build();
    return [this.service];
  }

  update(device: Device, state: DeviceState) {
    super.update(device, state);
    this.service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
  }
}
