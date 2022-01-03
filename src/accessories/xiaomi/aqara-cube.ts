import { Service } from 'homebridge';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';
import { ProgrammableSwitchServiceBuilder } from '../../builders/programmable-switch-service-builder';
import { DeviceState } from '../../zigbee/types';
import { ZigBeeAccessory } from '../zig-bee-accessory';

interface Button {
  index: number;
  displayName: string;
  subType: string;
}

export class AqaraCube extends ZigBeeAccessory {
  protected services: Service[];
  protected buttons: Button[] = [
    {
      index: 1,
      displayName: 'shake',
      subType: 'shake',
    },
    {
      index: 2,
      displayName: 'fall',
      subType: 'fall',
    },
    {
      index: 3,
      displayName: 'tap',
      subType: 'tap',
    },
    {
      index: 4,
      displayName: 'slide',
      subType: 'slide',
    },
    {
      index: 5,
      displayName: 'flip 180',
      subType: 'flip180',
    },
    {
      index: 6,
      displayName: 'flip 90',
      subType: 'flip90',
    },
    {
      index: 7,
      displayName: 'rotate left',
      subType: 'rotate_left',
    },
    {
      index: 8,
      displayName: 'rotate right',
      subType: 'rotate_right',
    },
  ];
  protected batteryService: Service;

  getAvailableServices(): Service[] {
    const builder = new ProgrammableSwitchServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    );

    this.buttons.forEach((button) => {
      builder.withStatelessSwitch(button.displayName, button.subType, button.index, [
        this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
      ]);
    });

    this.services = builder.build();

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryPercentage()
      .build();
    this.services.push(this.batteryService);

    return this.services;
  }

  update(state: DeviceState) {
    this.batteryService.updateCharacteristic(
      this.platform.Characteristic.BatteryLevel,
      state.battery || 0
    );
    this.batteryService.updateCharacteristic(
      this.platform.Characteristic.StatusLowBattery,
      state.battery && state.battery < 10
    );

    if (this.state.action == undefined) {
      return;
    }

    // get index of switchService by checking if button.subType matches the button from action
    const switchServiceIndex = this.buttons.findIndex(
      (button) => button.subType === this.state.action
    );

    // just to be sure probably not needed ¯\_(ツ)_/¯
    if (switchServiceIndex < 0) {
      return;
    }

    this.services[switchServiceIndex]
      .getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
      .setValue(this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);

    delete this.state.action;
  }
}
