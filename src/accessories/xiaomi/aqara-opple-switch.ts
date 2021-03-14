import { PlatformAccessory, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';
import { ProgrammableSwitchServiceBuilder } from '../../builders/programmable-switch-service-builder';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { DeviceState } from '../../zigbee/types';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { ZigBeeAccessory } from '../zig-bee-accessory';

export enum EventType {
  SINGLE,
  DOUBLE,
  HOLD,
}

interface Action {
  switchService: Service;
  eventType: EventType;
}

interface Button {
  index: number;
  displayName: string;
  subType: string;
}

abstract class AqaraOppleSwitch extends ZigBeeAccessory {
  protected services: Service[];
  protected buttons: Button[];
  protected withBattery = false;

  getAvailableServices(): Service[] {
    const builder = new ProgrammableSwitchServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    );

    this.buttons.forEach(button => {
      builder.withStatelessSwitch(button.displayName, button.subType, button.index, [
        EventType.SINGLE,
        EventType.DOUBLE,
        EventType.HOLD,
      ]);
    });

    this.services = builder.build();

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

    const action = this.parseAction(this.state.action);

    if (action !== null) {
      const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
      action.switchService.getCharacteristic(ProgrammableSwitchEvent).setValue(action.eventType);

      delete this.state.action;
    }
  }

  // actionString eg. 'button_2_double' => button with index 2 with EventType DOUBLE
  protected parseAction(actionString: string): Action | null {
    if (actionString == undefined) {
      return null;
    }

    const actionComponents = actionString.split('_');

    if (actionComponents.length !== 3 || actionComponents[0] !== 'button') {
      return null;
    }

    // get index of switchService by checking if button.index matches the button index from action
    const switchServiceIndex = this.buttons.findIndex(
      button => button.index === parseInt(actionComponents[1])
    );

    // just to be sure probably not needed ¯\_(ツ)_/¯
    if (switchServiceIndex < 0) {
      return null;
    }

    const action = {
      switchService: this.services[switchServiceIndex],
      eventType: undefined,
    };

    switch (actionComponents[2]) {
      case 'single':
        action.eventType = EventType.SINGLE;
        break;
      case 'double':
        action.eventType = EventType.DOUBLE;
        break;
      case 'hold':
        action.eventType = EventType.HOLD;
        break;
      default:
        return null;
    }

    return action;
  }
}

export class AqaraOppleSwitch2Buttons extends AqaraOppleSwitch {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device
  ) {
    super(platform, accessory, client, device);

    this.withBattery = true;
    this.buttons = [
      {
        index: 1,
        displayName: 'button_1',
        subType: 'top_left',
      },
      {
        index: 2,
        displayName: 'button_2',
        subType: 'top_right',
      },
    ];
  }
}

export class AqaraOppleSwitch4Buttons extends AqaraOppleSwitch {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device
  ) {
    super(platform, accessory, client, device);

    this.withBattery = true;
    this.buttons = [
      {
        index: 3,
        displayName: 'button_1',
        subType: 'top_left',
      },
      {
        index: 4,
        displayName: 'button_2',
        subType: 'top_right',
      },
      {
        index: 1,
        displayName: 'button_3',
        subType: 'bottom_left',
      },
      {
        index: 2,
        displayName: 'button_4',
        subType: 'bottom_right',
      },
    ];
  }
}

export class AqaraOppleSwitch6Buttons extends AqaraOppleSwitch {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device
  ) {
    super(platform, accessory, client, device);

    this.withBattery = true;
    this.buttons = [
      {
        index: 3,
        displayName: 'middle left',
        subType: 'middle_left',
      },
      {
        index: 4,
        displayName: 'middle right',
        subType: 'middle_right',
      },
      {
        index: 5,
        displayName: 'bottom left',
        subType: 'bottom_left',
      },
      {
        index: 6,
        displayName: 'bottom right',
        subType: 'bottom_right',
      },
      {
        index: 1,
        displayName: 'top left',
        subType: 'top_left',
      },
      {
        index: 2,
        displayName: 'top right',
        subType: 'top_right',
      },
    ];
  }
}
