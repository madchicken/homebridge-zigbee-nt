import { ZigBeeAccessory } from '../zig-bee-accessory';
import {
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  Service,
} from 'homebridge';
import { DeviceState } from '../../zigbee/types';

export class TuyaOnoffDoubleSwitch extends ZigBeeAccessory {
  protected switchServiceButtonLeft: Service;
  protected switchServiceButtonRight: Service;

  getAvailableServices(): Service[] {
    const Characteristic = this.platform.api.hap.Characteristic;

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
      .getCharacteristic(Characteristic.ProgrammableSwitchOutputState)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.state.state_left === 'ON' ? 1 : 0);
      })
      .on(
        CharacteristicEventTypes.SET,
        async (outputState: number, callback: CharacteristicSetCallback) => {
          try {
            await this.client.setLeftButtonOn(this.zigBeeDeviceDescriptor, outputState === 1);
            callback(null, outputState);
          } catch (e) {
            callback(e);
          }
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
      .getCharacteristic(Characteristic.ProgrammableSwitchOutputState)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.state.state_right === 'ON' ? 1 : 0);
      })
      .on(
        CharacteristicEventTypes.SET,
        async (outputState: number, callback: CharacteristicSetCallback) => {
          try {
            await this.client.setRightButtonOn(this.zigBeeDeviceDescriptor, outputState === 1);
            callback(null, outputState);
          } catch (e) {
            callback(e);
          }
        }
      );

    return [this.switchServiceButtonLeft, this.switchServiceButtonRight];
  }

  update(state: DeviceState) {
    const Characteristic = this.platform.api.hap.Characteristic;
    switch (state.state_left) {
      case 'ON':
        this.switchServiceButtonLeft.setCharacteristic(
          Characteristic.ProgrammableSwitchOutputState,
          1
        );
        break;
      case 'OFF':
        this.switchServiceButtonLeft.setCharacteristic(
          Characteristic.ProgrammableSwitchOutputState,
          0
        );
        break;
    }

    switch (state.state_right) {
      case 'ON':
        this.switchServiceButtonRight.setCharacteristic(
          Characteristic.ProgrammableSwitchOutputState,
          1
        );
        break;
      case 'OFF':
        this.switchServiceButtonRight.setCharacteristic(
          Characteristic.ProgrammableSwitchOutputState,
          0
        );
        break;
    }
  }
}
