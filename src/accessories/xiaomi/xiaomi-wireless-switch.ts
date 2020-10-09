import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ProgrammableSwitchServiceBuilder } from '../../builders/programmable-switch-service-builder';

export class XiaomiWirelessSwitch extends ZigBeeAccessory {
  protected switchServiceToggle: Service;
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
  this.batteryService
] = builder
      .withStatelessSwitch('ON/OFF', 'toggle', 1, [ProgrammableSwitchEvent.SINGLE_PRESS])
      .andBattery()
      .build();

    return [
      this.switchServiceToggle, 
      this.batteryService,
    ];
  }

  update(device: Device, state: DeviceState) {
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    super.update(device, state);
    switch (state.action) {
      case 'toggle':
        this.switchServiceToggle
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
    }
  }
}
