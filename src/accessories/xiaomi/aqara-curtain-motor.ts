import { PlatformAccessory, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';
import { WindowCoverServiceBuilder } from '../../builders/window-cover-service-builder';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { DeviceState } from '../../zigbee/types';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { ZigBeeAccessory } from '../zig-bee-accessory';
abstract class AqaraCurtainMotorGeneral extends ZigBeeAccessory {
  protected services: Service[];
  protected buttons: [];
  protected withBattery = false;

  getAvailableServices(): Service[] {
    const builder = new WindowCoverServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    );

    this.services = [builder.build()];

    if (this.withBattery) {
      this.services.push(
        new BatteryServiceBuilder(this.platform, this.accessory, this.client, this.state)
          .withBatteryPercentage()
          .build()
      );
    }

    return this.services;
  }

  update(state: DeviceState) {
    super.update(state);
  }
}


export class AqaraCurtainMotor extends AqaraCurtainMotorGeneral {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device
  ) {
    super(platform, accessory, client, device);

    this.withBattery = false;
  }
}
