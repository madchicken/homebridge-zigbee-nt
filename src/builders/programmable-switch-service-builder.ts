import { ZigBeeClient } from '../zigbee/zig-bee-client';
import {
  PlatformAccessory,
  Service,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
} from 'homebridge';
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
    index: number
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
    this.services.push(service);
    return this;
  }

  withStatefulSwitch(
    displayName: string,
    subType: string,
    index: number
  ): ProgrammableSwitchServiceBuilder {
    const Characteristic = this.platform.Characteristic;
    let btnState = false;
    const service =
      this.accessory.getServiceById(this.platform.Service.StatefulProgrammableSwitch, subType) ||
      this.accessory.addService(
        this.platform.Service.StatelessProgrammableSwitch,
        displayName,
        subType
      );
    service.setCharacteristic(Characteristic.Name, displayName);
    service.setCharacteristic(Characteristic.ServiceLabelIndex, index);
    service
      .getCharacteristic(Characteristic.ProgrammableSwitchOutputState)
      .on(
        CharacteristicEventTypes.SET,
        async (_state: number, callback: CharacteristicSetCallback) => {
          btnState = !btnState;
          callback(null, btnState ? 1 : 0);
        }
      );
    this.services.push(service);
    return this;
  }

  public andBattery(): ProgrammableSwitchServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    const service =
      this.accessory.getService(this.platform.Service.BatteryService) ||
      this.accessory.addService(this.platform.Service.BatteryService);

    service
      .getCharacteristic(Characteristic.BatteryLevel)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        callback(null, this.state.battery);
      });

    return this;
  }

  build(): Service[] {
    return this.services;
  }
}
