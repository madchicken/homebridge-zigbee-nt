import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { SwitchServiceBuilder } from '../../builders/switch-service-builder';

export class NamronSwitch extends ZigBeeAccessory {
  protected service: Service;

  getAvailableServices() {
    this.service = new SwitchServiceBuilder(this.platform, this.accessory, this.client, this.state)
      .withOnOff()
      .build();
    return [this.service];
  }

  async handleAccessoryIdentify() {
    await this.client.identify(this.zigBeeDeviceDescriptor);
  }
}
