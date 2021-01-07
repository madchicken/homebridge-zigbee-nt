import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { ProgrammableSwitchServiceBuilder } from '../../builders/programmable-switch-service-builder';

export class IkeaRemoteSwitch extends ZigBeeAccessory {
  protected switchServiceToggle: Service;
  protected switchServiceBrightUp: Service;
  protected switchServiceBrightDown: Service;
  protected switchServiceLeft: Service;
  protected switchServiceRight: Service;
  protected batteryService: Service;

  getAvailableServices(): Service[] {
    const builder = new ProgrammableSwitchServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    );

    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;

    [
      this.switchServiceToggle,
      this.switchServiceBrightUp,
      this.switchServiceBrightDown,
      this.switchServiceLeft,
      this.switchServiceRight,
      this.batteryService,
    ] = builder
      .withStatelessSwitch('ON/OFF', 'toggle', 1, [ProgrammableSwitchEvent.SINGLE_PRESS])
      .withStatelessSwitch('Brightness up', 'brightness_up', 2, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('Brightness down', 'brightness_down', 3, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('Left', 'left', 4, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('Right', 'right', 5, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .andBattery()
      .build();

    return [
      this.switchServiceToggle,
      this.switchServiceBrightUp,
      this.switchServiceBrightDown,
      this.switchServiceLeft,
      this.switchServiceRight,
      this.batteryService,
    ];
  }

  update(state: DeviceState) {
    super.update(state);
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    switch (state.action) {
      case 'brightness_up_click':
        this.switchServiceBrightUp
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'brightness_down_click':
        this.switchServiceBrightDown
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'toggle':
        this.switchServiceToggle
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'arrow_left_click':
        this.switchServiceLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'arrow_right_click':
        this.switchServiceRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      // LONG press
      case 'brightness_up_hold':
        this.switchServiceBrightUp
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'brightness_down_hold':
        this.switchServiceBrightDown
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'arrow_left_hold':
        this.switchServiceLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'arrow_right_hold':
        this.switchServiceRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
    }
  }
}
