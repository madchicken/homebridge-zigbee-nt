import {
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  PlatformAccessory,
} from 'homebridge';
import { get } from 'lodash';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';
import { HSBType } from '../utils/hsb-type';
import { DeviceState } from '../zigbee/types';

export class LighbulbServiceBuilder extends ServiceBuilder {
  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    state: DeviceState
  ) {
    super(platform, accessory, client, state);
    state.state = 'OFF';
    this.service =
      this.accessory.getService(platform.Service.Lightbulb) ||
      this.accessory.addService(platform.Service.Lightbulb);
  }

  public withOnOff(): LighbulbServiceBuilder {
    const Characteristic = this.Characteristic;

    this.service
      .getCharacteristic(Characteristic.On)
      .on(
        CharacteristicEventTypes.SET,
        async (yes: boolean, callback: CharacteristicSetCallback) => {
          if (this.isOnline) {
            try {
              Object.assign(this.state, await this.client.setOnState(this.device, yes));
              return callback();
            } catch (e) {
              return callback(e);
            }
          } else {
            return callback(new Error('Device is offline'));
          }
        }
      );
    this.service
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        if (this.isOnline) {
          this.client
            .getOnOffState(this.device)
            .then(s => {
              Object.assign(this.state, s);
              this.service.updateCharacteristic(Characteristic.On, this.state.state === 'ON');
            })
            .catch(e => {
              this.log.error(e.message);
            });
          return callback(null, this.state.state === 'ON');
        } else {
          return callback(new Error('Device is offline'));
        }
      });

    return this;
  }

  public withBrightness(): LighbulbServiceBuilder {
    const Characteristic = this.Characteristic;
    this.state.brightness_percent = 100;

    this.service
      .getCharacteristic(Characteristic.Brightness)
      .on(
        CharacteristicEventTypes.SET,
        async (brightnessPercent: number, callback: CharacteristicSetCallback) => {
          try {
            if (this.isOnline) {
              Object.assign(
                this.state,
                await this.client.setBrightnessPercent(this.device, brightnessPercent)
              );
              return callback();
            } else {
              return callback(new Error('Device is offline'));
            }
          } catch (e) {
            return callback(e);
          }
        }
      );
    this.service
      .getCharacteristic(Characteristic.Brightness)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        if (this.isOnline) {
          this.client
            .getBrightnessPercent(this.device)
            .then(s => {
              Object.assign(this.state, s);
              this.service.updateCharacteristic(
                Characteristic.Brightness,
                this.state.brightness_percent
              );
            })
            .catch(e => {
              this.log.error(e.message);
            });
          this.log.debug(
            `Reading Brightness for ${this.friendlyName}: ${this.state.brightness_percent}`
          );
          return callback(null, get(this.state, 'brightness_percent', 100));
        } else {
          return callback(new Error('Device is offline'));
        }
      });
    return this;
  }

  public withColorTemperature(): LighbulbServiceBuilder {
    const Characteristic = this.Characteristic;
    this.state.color_temp = 140;

    this.service
      .getCharacteristic(Characteristic.ColorTemperature)
      .on(
        CharacteristicEventTypes.SET,
        async (colorTemperature: number, callback: CharacteristicSetCallback) => {
          try {
            if (this.isOnline) {
              Object.assign(
                this.state,
                await this.client.setColorTemperature(this.device, colorTemperature)
              );
              return callback();
            } else {
              return callback(new Error('Device is offline'));
            }
          } catch (e) {
            return callback(e);
          }
        }
      );
    this.service
      .getCharacteristic(Characteristic.ColorTemperature)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        if (this.isOnline) {
          this.client
            .getColorTemperature(this.device)
            .then(s => {
              Object.assign(this.state, s);
              this.service.updateCharacteristic(
                Characteristic.ColorTemperature,
                this.state.color_temp
              );
            })
            .catch(e => this.log.error(e.message));
          this.log.debug(`Reading Color temp for ${this.friendlyName}: ${this.state.color_temp}`);
          return callback(null, get(this.state, 'color_temp', 140));
        } else {
          return callback(new Error('Device is offline'));
        }
      });

    return this;
  }

  public withHue(): LighbulbServiceBuilder {
    const Characteristic = this.Characteristic;
    this.state.color = {
      ...this.state.color,
      hue: 360,
    };

    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(
        CharacteristicEventTypes.SET,
        async (hue: number, callback: CharacteristicSetCallback) => {
          try {
            if (this.isOnline) {
              Object.assign(this.state, await this.client.setHue(this.device, hue));
              return callback();
            } else {
              return callback(new Error('Device is offline'));
            }
          } catch (e) {
            return callback(e);
          }
        }
      );
    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        if (this.isOnline) {
          this.log.debug(`Reading HUE for ${this.friendlyName}: ${this.state.color.hue}`);
          callback(null, get(this.state, 'color.hue', 360));
          return this.client
            .getHue(this.device)
            .then(s => {
              Object.assign(this.state, s);
              this.service.updateCharacteristic(Characteristic.Hue, s.color.hue);
            })
            .catch(e => this.log.error(e.message));
        } else {
          return callback(new Error('Device is offline'));
        }
      });

    return this;
  }

  /**
   * Special treatment for bulbs supporting only XY colors (IKEA Tådfri for example)
   * HomeKit only knows about HSB, so we need to manually convert values
   */
  public withColorXY(): LighbulbServiceBuilder {
    const Characteristic = this.Characteristic;
    this.state.brightness_percent = 100;
    this.state.color = {
      ...this.state.color,
      s: 100,
      hue: 360,
    };

    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.SET, async (h: number, callback: CharacteristicSetCallback) => {
        try {
          if (this.isOnline) {
            const s = this.service.getCharacteristic(Characteristic.Saturation).value as number;
            const v = this.service.getCharacteristic(Characteristic.Brightness).value as number;
            const hsbType = new HSBType(h, s, v);
            const [r, g, b] = hsbType.toRGBBytes();
            Object.assign(this.state, await this.client.setColorRGB(this.device, r, g, b));
            return callback();
          } else {
            return callback(new Error('Device is offline'));
          }
        } catch (e) {
          return callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        if (this.isOnline) {
          this.client
            .getColorXY(this.device)
            .then(s => {
              Object.assign(this.state, s);
              const Y =
                (this.service.getCharacteristic(Characteristic.Brightness).value as number) / 100;
              const hsbType = HSBType.fromXY(this.state.color.x, this.state.color.y, Y);
              this.state.color.hue = hsbType.hue;
              this.state.color.s = hsbType.saturation;
              this.state.brightness_percent = hsbType.brightness;
              this.service.updateCharacteristic(Characteristic.Hue, this.state.color.hue);
              this.service.updateCharacteristic(Characteristic.Saturation, this.state.color.s);
              this.service.updateCharacteristic(
                Characteristic.Brightness,
                this.state.brightness_percent
              );
            })
            .catch(e => this.log.error(e.message));
          this.log.debug(`Reading HUE for ${this.friendlyName}: ${this.state.color.hue}`);
          return callback(null, get(this.state, 'color.hue', 360));
        } else {
          return callback(new Error('Device is offline'));
        }
      });

    this.service
      .getCharacteristic(Characteristic.Saturation)
      .on(
        CharacteristicEventTypes.SET,
        async (saturation: number, callback: CharacteristicSetCallback) => {
          try {
            if (this.isOnline) {
              const v = this.service.getCharacteristic(Characteristic.Brightness).value as number;
              const hue = this.service.getCharacteristic(Characteristic.Hue).value as number;
              const hsbType = new HSBType(hue, saturation, v);
              const [r, g, b] = hsbType.toRGBBytes();
              await this.client.setColorRGB(this.device, r, g, b);
              return callback();
            } else {
              return callback(new Error('Device is offline'));
            }
          } catch (e) {
            return callback(e);
          }
        }
      );
    this.service
      .getCharacteristic(Characteristic.Saturation)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        if (this.isOnline) {
          this.client
            .getColorXY(this.device)
            .then(s => {
              Object.assign(this.state, s);
              const Y =
                (this.service.getCharacteristic(Characteristic.Brightness).value as number) / 100;
              const hsbType = HSBType.fromXY(this.state.color.x, this.state.color.y, Y);
              this.state.color.hue = hsbType.hue;
              this.state.color.s = hsbType.saturation;
              this.state.brightness = hsbType.brightness;
              this.service.updateCharacteristic(Characteristic.Hue, this.state.color.hue);
              this.service.updateCharacteristic(Characteristic.Saturation, this.state.color.s);
              this.service.updateCharacteristic(Characteristic.Brightness, this.state.brightness);
            })
            .catch(e => this.log.error(e.message));
          this.log.debug(`Reading Saturation for ${this.friendlyName}: ${this.state.color.s}`);
          return callback(null, get(this.state, 'color.s', 100));
        } else {
          return callback(new Error('Device is offline'));
        }
      });

    return this;
  }

  public withSaturation(): LighbulbServiceBuilder {
    const Characteristic = this.platform.Characteristic;
    this.state.color = {
      ...this.state.color,
      s: 100,
    };

    this.service
      .getCharacteristic(Characteristic.Saturation)
      .on(
        CharacteristicEventTypes.SET,
        async (saturation: number, callback: CharacteristicSetCallback) => {
          try {
            if (this.isOnline) {
              await this.client.setSaturation(this.device, saturation);
              return callback();
            } else {
              return callback(new Error('Device is offline'));
            }
          } catch (e) {
            return callback(e);
          }
        }
      );
    this.service
      .getCharacteristic(Characteristic.Saturation)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        if (this.isOnline) {
          this.log.debug(`Reading Saturation for ${this.friendlyName}: ${this.state.color.s}`);
          callback(null, get(this.state, 'color.s', 100));
          return this.client
            .getSaturation(this.device)
            .then(s => {
              Object.assign(this.state, s);
              this.service.updateCharacteristic(Characteristic.Saturation, this.state.color.s);
            })
            .catch(e => this.log.error(e.message));
        } else {
          return callback(new Error('Device is offline'));
        }
      });

    return this;
  }
}
