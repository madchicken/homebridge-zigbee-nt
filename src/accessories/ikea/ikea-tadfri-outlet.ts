import { ZigBeeAccessory } from '../../zig-bee-accessory';
import { OutletServiceBuilder } from '../../builders/outlet-service-builder';

export class IkeaTadfriOutlet extends ZigBeeAccessory {
  getAvailableServices() {
    return [
      new OutletServiceBuilder(this.platform, this.accessory, this.client, this.state)
        .withOnOff()
        .build(),
    ];
  }
}
