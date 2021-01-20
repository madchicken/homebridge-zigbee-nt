import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { ProgrammableSwitchServiceBuilder } from '../../builders/programmable-switch-service-builder';

export class PhilipsHueDimmableSwitch extends ZigBeeAccessory {
  protected switchServiceOn: Service;
  protected switchServiceOff: Service;
  protected switchServiceBrightUp: Service;
  protected switchServiceBrightDown: Service;
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
      this.switchServiceOn,
	  this.switchServiceOff,
      this.switchServiceBrightUp,
      this.switchServiceBrightDown,
      this.batteryService
    ] = builder
      .withStatelessSwitch('ON', 'on', 1, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('OFF', 'off', 2, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('Brightness up', 'brightness_up', 3, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('Brightness down', 'brightness_down', 4, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .andBattery()
      .build();

    return [
      this.switchServiceOn,
	  this.switchServiceOff,
      this.switchServiceBrightUp,
      this.switchServiceBrightDown,
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
      case 'on':
        this.switchServiceOn
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'off':
        this.switchServiceOff
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

    }
  }
}
