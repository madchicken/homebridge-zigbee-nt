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
import { BatteryServiceBuilder } from './battery-service-builder';

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

  withStatefulSwitch(
    displayName: string,
    subType: string,
    index: number
  ): ProgrammableSwitchServiceBuilder {
    const Characteristic = this.platform.Characteristic;
    const service =
      this.accessory.getServiceById(this.platform.Service.StatefulProgrammableSwitch, subType) ||
      this.accessory.addService(
        this.platform.Service.StatefulProgrammableSwitch,
        displayName,
        subType
      );
    service.setCharacteristic(Characteristic.Name, displayName);
    service.setCharacteristic(Characteristic.ServiceLabelIndex, index);
    service.setCharacteristic(Characteristic.ProgrammableSwitchOutputState, 0);
    let btnState = false;
    service
      .getCharacteristic(Characteristic.ProgrammableSwitchOutputState)
      .on(
        CharacteristicEventTypes.SET,
        async (_state: number, callback: CharacteristicSetCallback) => {
          btnState = !btnState;
          callback(null, btnState ? 1 : 0);
        }
      )
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        callback(null, btnState ? 1 : 0);
      });
    this.services.push(service);
    return this;
  }

  public andBattery(): ProgrammableSwitchServiceBuilder {
    const service = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryPercentage()
      .build();
    this.services.push(service);
    return this;
  }

  build(): Service[] {
    return this.services;
  }
}
