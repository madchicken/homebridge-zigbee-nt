import { Callback, CharacteristicEventTypes, PlatformAccessory } from 'homebridge';
import { ActionType, JsonPayload, ZigBeeClient } from '../zig-bee-client';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';
import { normalizeBrightness } from '../utils/color-fn';
import { HSBType } from '../utils/hsb-type';

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
          await this.client.setOn(this.device, yes);
          this.log.info(`New state for ${this.accessory.displayName}`, yes);
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        if (this.state.state) {
          const state = await this.client.getOnOffState(this.device, true);
          callback(null, state.state === 'ON');
        } else {
          const state = await this.client.getOnOffState(this.device);
          callback(null, state.state === 'ON');
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
        const value = await this.client.getBrightnessPercent(this.device, true);
        callback(null, value);
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
        const hue = await this.client.getHue(this.device, true);
        callback(null, hue);
      });

    return this;
  }

  /**
   * Special treatment for bulbs supporting only XY colors (IKEA Tådfri for example)
   * HomeKit only knows about HSB, so we need to manually convert values
   */
  public withColorXY(): LighbulbServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.SET, async (hue: number, callback: Callback) => {
        try {
          const v = await this.client.getBrightnessPercent(this.device, true);
          const s = this.service.getCharacteristic(Characteristic.Saturation).value as number;
          const hsbType = new HSBType(hue, s, v.brightness_percent);
          const [x, y] = hsbType.toXY();
          await this.client.setColorXY(this.device, x, y);
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const xy = await this.client.getColorXY(this.device, true);
        const brightness = await this.client.getBrightnessPercent(this.device, true);
        const hsbType = HSBType.fromXY(xy.color.x, xy.color.y, brightness.brightness_percent / 100);
        callback(null, hsbType.hue);
      });

    this.service
      .getCharacteristic(Characteristic.Saturation)
      .on(CharacteristicEventTypes.SET, async (saturation: number, callback: Callback) => {
        const v = await this.client.getBrightnessPercent(this.device, true);
        const hue = this.service.getCharacteristic(Characteristic.Hue).value as number;
        const hsbType = new HSBType(hue, saturation, v.brightness_percent);
        const [r, g, b] = hsbType.toRGBBytes();
        await this.client.setColorRGB(this.device, r, g, b);
        callback();
      });
    this.service
      .getCharacteristic(Characteristic.Saturation)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const xy = await this.client.getColorXY(this.device, true);
        const brightness = await this.client.getBrightnessPercent(this.device, true);
        const hsbType = HSBType.fromXY(xy.color.x, xy.color.y, brightness.brightness_percent / 100);
        callback(null, hsbType.saturation);
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
        const response = await this.client.getSaturation(this.device);
        callback(null, response.color.s);
      });

    return this;
  }
}
