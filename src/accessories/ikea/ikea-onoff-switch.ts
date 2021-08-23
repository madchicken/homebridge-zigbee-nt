import { BatteryServiceBuilder } from '../../builders/battery-service-builder';
import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { ProgrammableSwitchServiceBuilder } from '../../builders/programmable-switch-service-builder';
import { isNull, isUndefined } from 'lodash';

export class IkeaOnoffSwitch extends ZigBeeAccessory {
  protected switchServiceOn: Service;
  protected switchServiceOff: Service;
  protected batteryService: Service;

  getAvailableServices(): Service[] {
    const builder = new ProgrammableSwitchServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    );

    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    [this.switchServiceOn, this.switchServiceOff] = builder
      .withStatelessSwitch('ON', 'on', 1, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .withStatelessSwitch('OFF', 'off', 2, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .build();

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryPercentage()
      .build();

    return [this.switchServiceOn, this.switchServiceOff, this.batteryService];
  }

  update(state: DeviceState): void {
    const Characteristic = this.platform.Characteristic;
    const ProgrammableSwitchEvent = Characteristic.ProgrammableSwitchEvent;
    if (!isNull(state.battery) && !isUndefined(state.battery)) {
      this.batteryService.updateCharacteristic(Characteristic.BatteryLevel, state.battery || 0);
      this.batteryService.updateCharacteristic(
        Characteristic.StatusLowBattery,
        state.battery && state.battery < 10
      );
    }
    switch (state.action) {
      case 'brightness_move_up':
        this.switchServiceOn
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'brightness_move_down':
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
