import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Callback, CharacteristicEventTypes, Service } from 'homebridge';
import { BatteryServiceBuilder } from '../../builders/battery-service-builder';

export class XiaomiLeakSensor extends ZigBeeAccessory {
  private leakService: Service;
  private batteryService: Service;

  getAvailableServices() {
    const Characteristic = this.platform.Characteristic;

    this.leakService =
      this.accessory.getService(this.platform.Service.LeakSensor) ||
      this.accessory.addService(this.platform.Service.LeakSensor);

    this.leakService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        this.log.debug(`XiaomiLeakSensor get State for ${this.accessory.displayName}`, this.state);

        const leakDetected = this.state.water_leak === true;
        callback(
          null,
          leakDetected
            ? Characteristic.LeakDetected.LEAK_DETECTED
            : Characteristic.LeakDetected.LEAK_NOT_DETECTED
        );
      });

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryPercentage()
      .build();

    return [this.leakService, this.batteryService];
  }
}
