
import { ZigBeeAccessory } from '../zig-bee-accessory';
import { CharacteristicGetCallback, CharacteristicEventTypes, Service } from 'homebridge';
import { AmbientLightServiceBuilder } from '../../builders/ambient-light-service-builder';
import { DeviceState } from '../../zigbee/types';
import { isNull, isUndefined, get } from 'lodash';
import { HAP } from '../../index';

export class TuyaHumanPresenceSensor extends ZigBeeAccessory {
  private sensorService: Service;
  private ambientLightService; 

  getAvailableServices(): Service[] {
    const Service = this.platform.api.hap.Service;
    const Characteristic = this.platform.api.hap.Characteristic;

    this.sensorService =
      this.accessory.getService(Service.OccupancySensor) ||
      this.accessory.addService(Service.OccupancySensor);
    this.sensorService.setCharacteristic(Characteristic.Name, this.friendlyName);
    this.sensorService
      .getCharacteristic(Characteristic.OccupancyDetected)
      .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
        callback(
          null,
          this.state.presence
            ? Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
            : Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED
        );
      });

   this.ambientLightService = new AmbientLightServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withAmbientLightLevel()
      .build();


    return [this.sensorService, this.ambientLightService];
  }

  update(state: DeviceState) {
    super.update(state);
    const Characteristic = this.platform.api.hap.Characteristic;


    if (this.supports('presence') && !isNull(state.presence) && !isUndefined(state.presence) ) {
      this.log.info(`[TuyaHumanPresenceSensor] ${this.friendlyName} presence: ${state.presence}`);
      this.sensorService.updateCharacteristic(
        this.platform.Characteristic.OccupancyDetected,
        state.presence
            ? Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
            : Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
    }

    if (this.supports('illuminance_lux') && !isNull(state.illuminance_lux) && !isUndefined(state.illuminance_lux)) 
	{
        this.log.info(`[TuyaHumanPresenceSensor] ${this.friendlyName} illuminance_lux: ${state.illuminance_lux}`);
        this.ambientLightService.updateCharacteristic(
          this.platform.Characteristic.CurrentAmbientLightLevel,
          state.illuminance_lux );
    }
  }

}
