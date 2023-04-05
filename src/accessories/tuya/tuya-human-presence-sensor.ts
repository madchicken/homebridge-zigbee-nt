import { ZigBeeAccessory } from '../zig-bee-accessory';
import { CharacteristicGetCallback, CharacteristicEventTypes, Service } from 'homebridge';
import { AmbientLightServiceBuilder } from '../../builders/ambient-light-service-builder';

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
        if (this.state.contact) {
          this.log.debug(`Motion detected for sensor ${this.friendlyName}`);
        }
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
}
