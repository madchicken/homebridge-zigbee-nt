import { get } from 'lodash';
import { ServiceBuilder } from './service-builder';
import { CharacteristicEventTypes, CharacteristicGetCallback, PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { DeviceState, CurtainState } from '../zigbee/types';

export class WindowCoverServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    this.service =
      this.accessory.getService(platform.Service.WindowCovering) ||
      this.accessory.addService(platform.Service.WindowCovering);

    // create handlers for required characteristics
    this.service.getCharacteristic(this.Characteristic.CurrentPosition)
    .onGet(this.handleCurrentPositionGet.bind(this));

    this.service.getCharacteristic(this.Characteristic.PositionState)
      .onGet(this.handlePositionStateGet.bind(this));

    this.service.getCharacteristic(this.Characteristic.TargetPosition)
      .onGet(this.handleTargetPositionGet.bind(this))
      .onSet(this.handleTargetPositionSet.bind(this));
  }

  /**
   * Handle requests to get the current value of the "Current Position" characteristic
   */
   handleCurrentPositionGet() {
    return this.state.position;
  }


  /**
   * Handle requests to get the current value of the "Position State" characteristic
   */
  handlePositionStateGet() {
    return this.state.curtain_state === CurtainState.CLOSED
      ? this.Characteristic.PositionState.INCREASING
      : this.Characteristic.PositionState.DECREASING;
  }


  /**
   * Handle requests to get the current value of the "Target Position" characteristic
   */
  handleTargetPositionGet() {
    return this.state.position_target;
  }

  /**
   * Handle requests to set the "Target Position" characteristic
   */
  handleTargetPositionSet(value) {
    this.state.position = value;
    this.state.position_target = value;
  }
}
