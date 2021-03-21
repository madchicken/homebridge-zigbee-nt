import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState } from '../zigbee/types';

export class ProgrammableSwitchServiceBuilder {
  protected readonly client: ZigBeeClient;
  protected readonly accessory: PlatformAccessory;
  protected readonly platform: ZigbeeNTHomebridgePlatform;
  protected readonly state: DeviceState;
  protected readonly services: Service[];

  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    this.platform = platform;
    this.accessory = accessory;
    this.client = client;
    this.state = state;
    this.services = [];
  }

  withStatelessSwitch(
    displayName: string,
    subType: string,
    index: number,
    supportedActions?: number[]
  ): ProgrammableSwitchServiceBuilder {
    const service =
      this.accessory.getServiceById(this.platform.Service.StatelessProgrammableSwitch, subType) ||
      this.accessory.addService(
        this.platform.Service.StatelessProgrammableSwitch,
        displayName,
        subType
      );
    service.setCharacteristic(this.platform.Characteristic.Name, displayName);
    service.setCharacteristic(this.platform.Characteristic.ServiceLabelIndex, index);
    if (supportedActions && supportedActions.length) {
      service.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent).setProps({
        validValues: supportedActions,
      });
    }
    this.services.push(service);
    return this;
  }

  build(): Service[] {
    return this.services;
  }
}
