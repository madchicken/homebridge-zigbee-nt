import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { ProgrammableSwitchServiceBuilder } from '../../builders/programmable-switch-service-builder';

export class XiaomiWirelessSwitch extends ZigBeeAccessory {
  protected switchService: Service;
  protected batteryService: Service;

  getAvailableServices(): Service[] {
    const builder = new ProgrammableSwitchServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    );

    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    [this.switchService, this.batteryService] = builder
      .withStatelessSwitch('ON/OFF', 'toggle', 1, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.DOUBLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .andBattery()
      .build();

    return [this.switchService, this.batteryService];
  }

  update(state: DeviceState) {
    super.update(state);
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    switch (state.action) {
      case 'single':
        this.switchService
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
      case 'hold':
        this.switchService
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'double':
        this.switchService
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.DOUBLE_PRESS);
        break;
    }
  }
}
