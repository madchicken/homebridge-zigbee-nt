import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Callback, CharacteristicEventTypes, Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';

export class XiaomiLightIntensitySensor extends ZigBeeAccessory {
  private illuminanceService: Service;
  private batteryService: Service;

  getAvailableServices() {
    const Characteristic = this.platform.Characteristic;

    this.illuminanceService =
      this.accessory.getService(this.platform.Service.LightSensor) ||
      this.accessory.addService(this.platform.Service.LightSensor);

    this.illuminanceService
      .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        this.log.debug(
          `XiaomiLightIntensitySensor get ContactSensorState for ${this.accessory.displayName}`,
          this.state
        );

        callback(null, this.state.illuminance_lux);
      });

    this.illuminanceService
      .getCharacteristic(Characteristic.StatusLowBattery)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        this.log.debug(
          `XiaomiLightIntensitySensor get StatusLowBattery for ${this.accessory.displayName}`,
          this.state
        );

        callback(
          null,
          this.state.battery && this.state.battery <= 10
            ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        );
      });

    this.batteryService =
      this.accessory.getService(this.platform.Service.BatteryService) ||
      this.accessory.addService(this.platform.Service.BatteryService);

    this.batteryService
      .getCharacteristic(Characteristic.BatteryLevel)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        this.log.debug(
          `XiaomiLightIntensitySensor get BatteryLevel for ${this.accessory.displayName}`,
          this.state
        );

        callback(null, this.state.battery || 100);
      });

    return [this.illuminanceService, this.batteryService];
  }

  update(state: DeviceState) {
    const Characteristic = this.platform.Characteristic;
    this.log.debug(
      `XiaomiLightIntensitySensor update ContactSensorState for ${this.accessory.displayName}`,
      this.state
    );

    super.update(state);
    this.illuminanceService
      .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
      .setValue(this.state.illuminance_lux);
  }
}
