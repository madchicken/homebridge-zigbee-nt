import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { Device } from 'zigbee-herdsman/dist/controller/model';

export class IkeaOnoffSwitch extends ZigBeeAccessory {
  protected switchServiceOn: Service;
  protected switchServiceOff: Service;

  getAvailableServices(): Service[] {
    this.switchServiceOn =
      this.accessory.getServiceById(this.platform.Service.StatelessProgrammableSwitch, 'on') ||
      this.accessory.addService(this.platform.Service.StatelessProgrammableSwitch, 'ON', 'on');

    this.switchServiceOff =
      this.accessory.getServiceById(this.platform.Service.StatelessProgrammableSwitch, 'off') ||
      this.accessory.addService(this.platform.Service.StatelessProgrammableSwitch, 'OFF', 'off');

    this.switchServiceOn.setCharacteristic(this.platform.Characteristic.Name, 'On button');
    this.switchServiceOn.setCharacteristic(this.platform.Characteristic.ServiceLabelIndex, 1);

    this.switchServiceOff.setCharacteristic(this.platform.Characteristic.Name, 'Off button');
    this.switchServiceOff.setCharacteristic(this.platform.Characteristic.ServiceLabelIndex, 2);

    return [this.switchServiceOn, this.switchServiceOff];
  }

  update(device: Device, state: DeviceState) {
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    super.update(device, state);
    switch (state.click) {
      case 'brightness_up':
        this.switchServiceOn
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'brightness_down':
        this.switchServiceOff
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
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
    }
  }
}
