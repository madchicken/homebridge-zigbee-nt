import { ZigBeeAccessory } from '../zig-bee-accessory';
import { CharacteristicEventTypes, Service, Callback } from 'homebridge';
import { ZigBeeDevice } from '../zigbee';

export class PhilipsHueWhiteAndColor extends ZigBeeAccessory {
  private lightbulbService: Service;

  get name() { return 'Philips Hue white and color ambiance' };

  getAvailableServices() {
    const Service = this.platform.Service;
    const Characteristic = this.platform.Characteristic;

    this.lightbulbService =
      this.accessory.getService(Service.Lightbulb) ||
      this.accessory.addService(Service.Lightbulb);

    this.lightbulbService
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.SET, async (yes: boolean, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', { state: yes ? 'ON' : 'OFF' })
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.lightbulbService
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', { state: 'ON' });
        callback(null, response && response.getClusterAttributeValue('genOnOff', 'onOff'));
      });

    this.lightbulbService
      .getCharacteristic(Characteristic.Brightness)
      .on(CharacteristicEventTypes.SET, async (brightness_percent: number, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', { brightness_percent })
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.lightbulbService
      .getCharacteristic(Characteristic.Brightness)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', { brightness_percent: 0 });
        const value = response && response.getClusterAttributeValue('genLevelCtrl', 'currentLevel');
        callback(null, value);
      });

    this.lightbulbService
      .getCharacteristic(Characteristic.ColorTemperature)
      .on(CharacteristicEventTypes.SET, async (color_temp: number, callback: Callback) => {
        try {
          this.log.info(`Set Color temp to ${color_temp}`);
          await this.client.sendMessage(this.accessory.context, 'set', { color_temp });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.lightbulbService
      .getCharacteristic(Characteristic.ColorTemperature)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', { color_temp: 0 });
        const color_temp = response && response.getClusterAttributeValue('lightingColorCtrl', 'colorTemperature');
        callback(null, color_temp);
      });

    this.lightbulbService
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.SET, async (hue: number, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', { color: { hue } });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.lightbulbService
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', { color: { hue: 0 } });
        const hue = response && response.getClusterAttributeValue('lightingColorCtrl', 'currentHue');
        callback(null, hue);
      });

    this.lightbulbService
      .getCharacteristic(Characteristic.Saturation)
      .on(CharacteristicEventTypes.SET, async (saturation: number, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', { color: { s: saturation } });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.lightbulbService
      .getCharacteristic(Characteristic.Saturation)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', { color: { s: 0 } });
        const hue = response && response.getClusterAttributeValue('lightingColorCtrl', 'currentSaturation');
        callback(null, hue);
      });

    return [this.lightbulbService];
  }
}
