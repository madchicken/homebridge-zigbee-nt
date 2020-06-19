import { Callback, CharacteristicEventTypes, PlatformAccessory } from 'homebridge';
import { ActionType, JsonPayload, ZigBeeClient } from '../zig-bee-client';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';

function normalizeBrightness(value: number): number {
  return Math.round((value / 254) * 100);
}

function xyToHSL(x: number, y: number) {}

export class LighbulbServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: JsonPayload
  ) {
    super(platform, accessory, client, state);
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
          await this.client.setState(this.device, yes, this.state);
          this.log.info(`New state for ${this.accessory.displayName}`, this.state);
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        if (this.state.state) {
          const state = await this.client.getState(this.device);
          callback(null, state.state === 'ON');
        } else {
          const response = await this.client.sendMessage(
            this.device,
            ActionType.get,
            {
              state: 'ON',
            },
            this.state
          );
          callback(null, response && response.getClusterAttributeValue('genOnOff', 'onOff'));
        }
      });

    return this;
  }

  public withBrightness(): LighbulbServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.Brightness)
      .on(CharacteristicEventTypes.SET, async (brightness_percent: number, callback: Callback) => {
        try {
          await this.client.sendMessage(
            this.device,
            ActionType.set,
            { brightness_percent },
            this.state
          );
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.Brightness)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(
          this.device,
          ActionType.get,
          {
            brightness: 0,
          },
          this.state
        );
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
          await this.client.sendMessage(this.device, ActionType.set, { color_temp });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.ColorTemperature)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.device, ActionType.get, {
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
          await this.client.sendMessage(this.device, ActionType.set, { color: { hue } });
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.device, ActionType.get, {
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
          await this.client.sendMessage(this.device, ActionType.set, {
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
        const payload = await this.client.getColorXY(this.device);
        if (payload) {
          this.platform.log.info(`Got response for RGB `, payload);
          const z = 1 - payload.color.x - payload.color.y;
          const Y = payload.brightness;
          callback(null, 100);
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
          await this.client.sendMessage(
            this.device,
            ActionType.set,
            {
              color: { s: saturation },
            },
            this.state
          );
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.Saturation)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(
          this.device,
          ActionType.get,
          {
            color: { s: 0 },
          },
          this.state
        );
        this.platform.log.info(`Got response for saturation `, response.clusters);
        const saturation =
          response && response.getClusterAttributeValue('lightingColorCtrl', 'currentSaturation');
        callback(null, saturation);
      });

    return this;
  }
}
