import { ZigBeeAccessory } from '../zig-bee-accessory';
import { CharacteristicEventTypes, Service, Callback } from 'homebridge';

export class PhilipsHueWhite extends ZigBeeAccessory {
  private lightbulbService: Service;

  get name() { return 'HUE Bulb' };

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

    return [this.lightbulbService];
  }
}
