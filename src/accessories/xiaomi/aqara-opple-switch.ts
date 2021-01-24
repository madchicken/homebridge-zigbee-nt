import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { ProgrammableSwitchServiceBuilder } from '../../builders/programmable-switch-service-builder';

export class AqaraOppleSwitch6Buttons extends ZigBeeAccessory {
  protected switchServiceTopLeft: Service;
  protected switchServiceTopRight: Service;
  protected switchServiceMiddleLeft: Service;
  protected switchServiceMiddleRight: Service;
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
        this.switchServiceMiddleLeft,
        this.switchServiceMiddleRight,
        this.switchServiceBottomLeft, 
        this.switchServiceBottomRight,
        this.switchServiceTopLeft,
        this.switchServiceTopRight,
        this.batteryService,
    ] = builder
      .withStatelessSwitch('top left', 'top_left', 3, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('top right', 'top_right', 4, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('bottom left', 'bottom_left', 1, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('bottom right', 'bottom_right', 2, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('middle left', 'middle_left', 5, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('middle right', 'middle_right', 6, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .andBattery()
      .build();

    return [
        this.switchServiceBottomLeft, 
        this.switchServiceBottomRight,
        this.switchServiceTopLeft,
        this.switchServiceTopRight,
        this.switchServiceMiddleLeft,
        this.switchServiceMiddleRight,
        this.batteryService
    ];
  }

  update(state: DeviceState) {
    super.update(state);
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    switch (state.action) {
    //single press
      case 'button_1_single':
        this.switchServiceTopLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'button_2_single':
        this.switchServiceTopRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'button_3_single':
        this.switchServiceMiddleLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'button_4_single':
        this.switchServiceMiddleRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'button_5_single':
        this.switchServiceBottomLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'button_6_single':
        this.switchServiceBottomRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
    
        
    //double press
      case 'button_1_double':
        this.switchServiceTopLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      case 'button_2_double':
        this.switchServiceTopRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      case 'button_3_double':
        this.switchServiceMiddleLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      case 'button_4_double':
        this.switchServiceMiddleRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      case 'button_5_double':
        this.switchServiceBottomLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      case 'button_6_double':
        this.switchServiceBottomRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
    //long press
      case 'button_1_hold':
        this.switchServiceTopLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'button_2_hold':
        this.switchServiceTopRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'button_3_hold':
        this.switchServiceMiddleLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'button_4_hold':
        this.switchServiceMiddleRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
       case 'button_5_hold':
        this.switchServiceBottomLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'button_6_hold':
        this.switchServiceBottomRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;

    }
  }
}

export class AqaraOppleSwitch4Buttons extends ZigBeeAccessory {
  protected switchServiceTopLeft: Service;
  protected switchServiceTopRight: Service;
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
        this.switchServiceTopLeft,
        this.switchServiceTopRight,
        this.batteryService,
    ] = builder
      .withStatelessSwitch('button_1', 'top_left', 3, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('button_2', 'top_right', 4, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('button_3', 'bottom_left', 1, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('button_4', 'bottom_right', 2, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .andBattery()
      .build();

    return [
        this.switchServiceBottomLeft, 
        this.switchServiceBottomRight,
        this.switchServiceTopLeft,
        this.switchServiceTopRight,
        this.batteryService
    ];
  }

  update(state: DeviceState) {
    super.update(state);
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    switch (state.action) {
    //single press
      case 'button_1_single':
        this.switchServiceTopLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'button_2_single':
        this.switchServiceTopRight
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
        this.switchServiceTopLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      case 'button_2_double':
        this.switchServiceTopRight
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
    //long press
      case 'button_1_hold':
        this.switchServiceTopLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'button_2_hold':
        this.switchServiceTopRight
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

export class AqaraOppleSwitch2Buttons extends ZigBeeAccessory {
  protected switchServiceTopLeft: Service;
  protected switchServiceTopRight: Service;
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
        this.switchServiceTopLeft,
        this.switchServiceTopRight,
        this.batteryService,
    ] = builder
      .withStatelessSwitch('button_1', 'top_left', 1, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('button_2', 'top_right', 2, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .andBattery()
      .build();

    return [
        this.switchServiceTopLeft,
        this.switchServiceTopRight,
        this.batteryService
    ];
  }

  update(state: DeviceState) {
    super.update(state);
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    switch (state.action) {
    //single press
      case 'button_1_single':
        this.switchServiceTopLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'button_2_single':
        this.switchServiceTopRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
    //double press
      case 'button_1_double':
        this.switchServiceTopLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      case 'button_2_double':
        this.switchServiceTopRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
      //long press
      case 'button_1_hold':
        this.switchServiceTopLeft
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'button_2_hold':
        this.switchServiceTopRight
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
    }
  }
}

