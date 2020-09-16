import { ZigBeeAccessory } from '../zig-bee-accessory';
import {
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  Service,
} from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { Device } from 'zigbee-herdsman/dist/controller/model';

export class XiaomiOnoffSwitch extends ZigBeeAccessory {
  protected switchServiceButton: Service;

  getAvailableServices(): Service[] {
    const Characteristic = this.platform.api.hap.Characteristic;

    this.switchServiceButton =
      this.accessory.getServiceById(
        this.platform.Service.StatefulProgrammableSwitch,
        'button'
      ) ||
      this.accessory.addService(
        this.platform.Service.StatefulProgrammableSwitch,
        'Button',
        'button'
      );

    this.switchServiceButton.setCharacteristic(
      this.platform.Characteristic.Name,
      'Button'
    );
    this.switchServiceButton.setCharacteristic(
      this.platform.Characteristic.ServiceLabelIndex,
      1
    );
    this.switchServiceButton
      .getCharacteristic(Characteristic.ProgrammableSwitchOutputState)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.state.state === 'ON' ? 1 : 0);
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

   return [this.switchServiceButton];
  }

  update(device: Device, state: DeviceState) {
    super.update(device, state);
    const Characteristic = this.platform.api.hap.Characteristic;
    switch (state.state_left) {
      case 'ON':
        this.switchServiceButton.setCharacteristic(
          Characteristic.ProgrammableSwitchOutputState,
          1
        );
        break;
      case 'OFF':
        this.switchServiceButton.setCharacteristic(
          Characteristic.ProgrammableSwitchOutputState,
          0
        );
        break;
    }
   
  }
}
