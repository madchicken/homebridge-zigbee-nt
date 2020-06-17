import { Callback, CharacteristicEventTypes, PlatformAccessory, Service } from 'homebridge';
import { ZigBeeClient } from '../zig-bee-client';
import { ZigbeeNTHomebridgePlatform } from '../platform';

function normalizeBrightness(value: number) {
  return Math.round((value / 254) * 100);
}

export class LighbulbServiceBuilder {
  private readonly client: ZigBeeClient;
  private readonly accessory: PlatformAccessory;
  private readonly platform: ZigbeeNTHomebridgePlatform;
  private readonly service: Service;

  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient
  ) {
    this.platform = platform;
    this.accessory = accessory;
    this.client = client;
    this.service =
      this.accessory.getService(platform.Service.Lightbulb) ||
      this.accessory.addService(platform.Service.Lightbulb);
  }

  public withOnOff(): LighbulbServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.SET, async (yes: boolean, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', {
            state: yes ? 'ON' : 'OFF',
          });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', {
          state: 'ON',
        });
        callback(null, response && response.getClusterAttributeValue('genOnOff', 'onOff'));
      });

    return this;
  }

  public withBrightness(): LighbulbServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.Brightness)
      .on(CharacteristicEventTypes.SET, async (brightness_percent: number, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', { brightness_percent });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.Brightness)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', {
          brightness: 0,
        });
        const value = response && response.getClusterAttributeValue('genLevelCtrl', 'currentLevel');
        callback(null, normalizeBrightness(Number(value)));
      });
    return this;
  }

  public withColorTemperature(): LighbulbServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.ColorTemperature)
      .on(CharacteristicEventTypes.SET, async (color_temp: number, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', { color_temp });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.ColorTemperature)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', {
          color_temp: 0,
        });
        const color_temp =
          response && response.getClusterAttributeValue('lightingColorCtrl', 'colorTemperature');
        callback(null, color_temp);
      });

    return this;
  }

  public withHue(): LighbulbServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.SET, async (hue: number, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', { color: { hue } });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', {
          color: { hue: 0 },
        });
        const hue =
          response && response.getClusterAttributeValue('lightingColorCtrl', 'currentHue');
        callback(null, hue);
      });

    return this;
  }

  public withColorXY(): LighbulbServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.SET, async (hue: number, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', {
            color: { r: Math.round((hue / 254) * hue), g: 0, b: 0 },
          });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', {
          color: { x: 0, y: 0 },
        });
        if (response) {
          this.platform.log.info(`Got response for colorXY `, response.clusters);
          const hue = response.getClusterAttributeValue('lightingColorCtrl', 'currentHue');
          callback(null, hue);
        } else {
          callback(null, 0);
        }
      });

    return this;
  }

  public withSaturation(): LighbulbServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.Saturation)
      .on(CharacteristicEventTypes.SET, async (saturation: number, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', {
            color: { s: saturation },
          });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.Saturation)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', {
          color: { s: 0 },
        });
        this.platform.log.info(`Got response for saturation `, response.clusters);
        const saturation =
          response && response.getClusterAttributeValue('lightingColorCtrl', 'currentSaturation');
        callback(null, saturation);
      });

    return this;
  }

  public build(): Service {
    return this.service;
  }
}
