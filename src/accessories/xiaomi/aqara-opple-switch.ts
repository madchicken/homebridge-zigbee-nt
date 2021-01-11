import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { ProgrammableSwitchServiceBuilder } from '../../builders/programmable-switch-service-builder';

export class AqaraOppleSwitch extends ZigBeeAccessory {
  protected switchServiceUpperLeft: Service;
  protected switchServiceUpperRight: Service;
  protected switchServiceBottomLeft: Service;
  protected switchServiceBottomRight: Service;
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
        this.switchServiceBottomLeft, 
        this.switchServiceBottomRight,
        this.switchServiceUpperLeft,
        this.switchServiceUpperRight,
        this.batteryService,
    ] = builder
      .withStatelessSwitch('button_1', 'top_left', 1, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.TRIPPLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('button_2', 'top_right', 2, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.TRIPPLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('button_3', 'bottom_left', 3, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.TRIPPLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('button_4', 'bottom_right', 4, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.TRIPPLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .andBattery()
      .build();

    return [
        this.switchServiceBottomLeft, 
        this.switchServiceBottomRight,
        this.switchServiceUpperLeft,
        this.switchServiceUpperRight,
        this.batteryService
    ];
  }

  update(state: DeviceState) {
    super.update(state);
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    switch (state.action) {
    //single press
      case 'button_1_single':
        this.switchServiceUpperLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'button_2_single':
        this.switchServiceUpperRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'button_3_single':
        this.switchServiceBottomLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'button_4_single':
        this.switchServiceBottomRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
    //double press
      case 'button_1_double':
        this.switchServiceUpperLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      case 'button_2_double':
        this.switchServiceUpperRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      case 'button_3_double':
        this.switchServiceBottomLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      case 'button_4_double':
        this.switchServiceBottomRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
    // tripple press
    //   case 'button_1_tripple':
    //     this.switchServiceUpperLeft
    //       .getCharacteristic(ProgrammableSwitchEvent)
    //       .setValue(ProgrammableSwitchEvent.TRIPPLE_PRESS);
    //     break;
    //   case 'button_2_tripple':
    //     this.switchServiceUpperRight
    //       .getCharacteristic(ProgrammableSwitchEvent)
    //       .setValue(ProgrammableSwitchEvent.TRIPPLE_PRESS);
    //     break;
    //   case 'button_3_tripple':
    //     this.switchServiceBottomLeft
    //       .getCharacteristic(ProgrammableSwitchEvent)
    //       .setValue(ProgrammableSwitchEvent.TRIPPLE_PRESS);
    //     break;
    //   case 'button_4_tripple':
    //     this.switchServiceBottomRight
    //       .getCharacteristic(ProgrammableSwitchEvent)
    //       .setValue(ProgrammableSwitchEvent.TRIPPLE_PRESS);
    //     break;
    //long press
      case 'button_1_hold':
        this.switchServiceUpperLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'button_2_hold':
        this.switchServiceUpperRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'button_3_hold':
        this.switchServiceBottomLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'button_4_hold':
        this.switchServiceBottomRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;

    }
  }
}
