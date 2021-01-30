import { ServiceBuilder } from './service-builder';
import { CharacteristicEventTypes, CharacteristicGetCallback, PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { DeviceState } from '../zigbee/types';

export const LOW_BATTERY_THRESHOLD = 10;

export class BatteryServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    this.service =
      this.accessory.getService(platform.Service.BatteryService) ||
      this.accessory.addService(platform.Service.BatteryService);
  }

  /**
   * Expose a service with battery percentage and notification when the battery level
   * goes under {@link LOW_BATTERY_THRESHOLD}
   */
  public withBatteryPercentage(): BatteryServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.BatteryLevel)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        callback(null, this.state.battery);
      });
    this.service
      .getCharacteristic(Characteristic.StatusLowBattery)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        callback(
          null,
          this.state.battery && this.state.battery <= LOW_BATTERY_THRESHOLD
            ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        );
      });

    return this;
  }
}
