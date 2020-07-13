import { ZigBeeAccessory } from '../zig-bee-accessory';
import {
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  Service,
} from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ProgrammableSwitchOutputState } from 'hap-nodejs/dist/lib/gen/HomeKit-Bridge';

export class TuyaOnoffDoubleSwitch extends ZigBeeAccessory {
  protected switchServiceButtonLeft: Service;
  protected switchServiceButtonRight: Service;

  getAvailableServices(): Service[] {
    this.switchServiceButtonLeft =
      this.accessory.getServiceById(
        this.platform.Service.StatefulProgrammableSwitch,
        'button_left'
      ) ||
      this.accessory.addService(
        this.platform.Service.StatefulProgrammableSwitch,
        'Left Button',
        'button_left'
      );

    this.switchServiceButtonRight =
      this.accessory.getServiceById(
        this.platform.Service.StatefulProgrammableSwitch,
        'button_right'
      ) ||
      this.accessory.addService(
        this.platform.Service.StatefulProgrammableSwitch,
        'Right Button',
        'button_right'
      );

    this.switchServiceButtonLeft.setCharacteristic(
      this.platform.Characteristic.Name,
      'Button Left'
    );
    this.switchServiceButtonLeft.setCharacteristic(
      this.platform.Characteristic.ServiceLabelIndex,
      1
    );
    this.switchServiceButtonLeft
      .getCharacteristic(ProgrammableSwitchOutputState)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.state.state_left === 'ON' ? 1 : 0);
      })
      .on(
        CharacteristicEventTypes.SET,
        async (outputState: number, callback: CharacteristicSetCallback) => {
          await this.client.setLeftButtonOn(this.zigBeeDeviceDescriptor, outputState === 1);
          callback(null, outputState);
        }
      );

    this.switchServiceButtonRight.setCharacteristic(
      this.platform.Characteristic.Name,
      'Button Right'
    );
    this.switchServiceButtonRight.setCharacteristic(
      this.platform.Characteristic.ServiceLabelIndex,
      2
    );
    this.switchServiceButtonLeft
      .getCharacteristic(ProgrammableSwitchOutputState)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.state.state_right === 'ON' ? 1 : 0);
      })
      .on(
        CharacteristicEventTypes.SET,
        async (outputState: number, callback: CharacteristicSetCallback) => {
          await this.client.setRightButtonOn(this.zigBeeDeviceDescriptor, outputState === 1);
          callback(null, outputState);
        }
      );

    return [this.switchServiceButtonLeft, this.switchServiceButtonRight];
  }

  update(device: Device, state: DeviceState) {
    super.update(device, state);
    switch (state.state_left) {
      case 'ON':
        this.switchServiceButtonLeft.setCharacteristic(ProgrammableSwitchOutputState, 1);
        break;
      case 'OFF':
        this.switchServiceButtonLeft.setCharacteristic(ProgrammableSwitchOutputState, 0);
        break;
    }

    switch (state.state_right) {
      case 'ON':
        this.switchServiceButtonRight.setCharacteristic(ProgrammableSwitchOutputState, 1);
        break;
      case 'OFF':
        this.switchServiceButtonRight.setCharacteristic(ProgrammableSwitchOutputState, 0);
        break;
    }
  }
}
