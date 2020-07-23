import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { Device } from 'zigbee-herdsman/dist/controller/model';
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

    [
      this.switchServiceToggle,
      this.switchServiceBrightUp,
      this.switchServiceBrightDown,
      this.switchServiceLeft,
      this.switchServiceRight,
      this.batteryService,
    ] = builder
      .withSwitch('ON/OFF', 'toggle', 1)
      .withSwitch('Brightness up', 'brightness_up', 2)
      .withSwitch('Brightness down', 'brightness_down', 3)
      .withSwitch('Left', 'left', 4)
      .withSwitch('Right', 'right', 5)
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

  update(device: Device, state: DeviceState) {
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    super.update(device, state);
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
      case 'brightness_up_release':
        this.switchServiceBrightUp
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'brightness_down_release':
        this.switchServiceBrightDown
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'arrow_left_release':
        this.switchServiceLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'arrow_right_release':
        this.switchServiceRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
    }
  }
}
