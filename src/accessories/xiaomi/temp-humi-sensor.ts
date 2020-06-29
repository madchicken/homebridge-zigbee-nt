import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Callback, CharacteristicEventTypes, Service } from 'homebridge';

export class TempHumiSensor extends ZigBeeAccessory {
  private service: Service;

  getAvailableServices() {
    const Characteristic = this.platform.Characteristic;
    const temperatureService =
      this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);

    temperatureService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const state = await this.client.getTemperature(this.zigBeeDeviceDescriptor);
        callback(null, state.temperature);
      });

    const humidityService =
      this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);

    humidityService
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const state = await this.client.getHumidity(this.zigBeeDeviceDescriptor);
        callback(null, state.humidity);
      });

    return [temperatureService];
  }

  protected updateDevice() {}
}
