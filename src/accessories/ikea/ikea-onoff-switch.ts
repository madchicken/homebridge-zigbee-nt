import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { Device } from 'zigbee-herdsman/dist/controller/model';

export class IkeaOnoffSwitch extends ZigBeeAccessory {
  protected switchServiceOn: Service;
  protected switchServiceOff: Service;

  getAvailableServices(): Service[] {
    this.switchServiceOn =
      this.accessory.getService(this.platform.Service.StatelessProgrammableSwitch) ||
      this.accessory.addService(this.platform.Service.StatelessProgrammableSwitch);

    this.switchServiceOn.getCharacteristic(this.platform.Characteristic.Name).setValue('On');

    this.switchServiceOff.getCharacteristic(this.platform.Characteristic.Name).setValue('Off');

    return [this.switchServiceOn, this.switchServiceOff];
  }

  update(device: Device, state: DeviceState) {
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    super.update(device, state);
    if (state.click === 'on') {
      this.switchServiceOn
        .getCharacteristic(ProgrammableSwitchEvent)
        .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
    } else if (state.click === 'off') {
      this.switchServiceOff
        .getCharacteristic(ProgrammableSwitchEvent)
        .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
    }
  }
}
