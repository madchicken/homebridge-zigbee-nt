import { ZigBeeClient } from '../zigbee/zig-bee-client';
import {
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  PlatformAccessory,
  Service,
} from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';
import { DeviceState } from '../zigbee/types';

export class MotionSensorServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    this.service =
      this.accessory.getService(platform.Service.MotionSensor) ||
      this.accessory.addService(platform.Service.MotionSensor);
  }

  public withOccupancy(): MotionSensorServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.MotionDetected)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        callback(null, this.state.occupancy);
      });

    return this;
  }

  public build(): Service {
    return this.service;
  }
}
