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
          this.client.getOnOffState(this.device).catch(e => {
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
          this.client.getBrightnessPercent(this.device).catch(e => {
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
          this.client.getColorTemperature(this.device).catch(e => this.log.error(e.message));
          this.log.debug(`Reading Color temp for ${this.friendlyName}: ${this.state.color_temp}`);
          return callback(null, get(this.state, 'color_temp', 140));
        } else {
          return callback(new Error('Device is offline'));
        }
      });

    return this;
  }

  private withHue(): LighbulbServiceBuilder {
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
              return callback(null, get(this.state, 'color.hue', 360));
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
          this.log.debug(
            `[light-bulb-service] Reading HUE for ${this.friendlyName}: ${this.state.color.hue}`
          );
          callback(null, get(this.state, 'color.hue', 360));
          return this.client
            .getHue(this.device)
            .catch(e => this.log.error(`[light-bulb-service] Error reading HUE: ${e.message}`));
        } else {
          this.log.warn(`[light-bulb-service] ${this.friendlyName} is offline, skipping GET Hue`);
          return callback(new Error('Device is offline'));
        }
      });

    return this;
  }

  /**
   * Special treatment for bulbs supporting HS color
   * HomeKit only knows about HSB, so we need to manually convert values
   */
  public withColorHS(): LighbulbServiceBuilder {
    return this.withHue()
      .withSaturation()
      .withBrightness();
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

    const updateClientColor = async () => {
      const hsb = new HSBType(
        this.state.color.hue,
        this.state.color.s,
        this.state.brightness_percent
      );
      const [x, y] = hsb.toXY();
      const state = await this.client.setColorXY(this.device, x, y);
      const resultHsbType = HSBType.fromXY(state.color.x, state.color.y);
      this.state.color.hue = resultHsbType.hue;
      this.state.color.s = resultHsbType.saturation;
    };

    this.service
      .getCharacteristic(Characteristic.Hue)
      .on(CharacteristicEventTypes.SET, async (h: number, callback: CharacteristicSetCallback) => {
        try {
          if (this.isOnline) {
            /* Update state immediately so other requests use the latest settings */
            this.state.color.hue = h;

            await updateClientColor();
            return callback(null, get(this.state, 'color.hue', 360));
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
          /* Trigger read that will be reported later by internalUpdate */
          this.client.getColorXY(this.device).catch(e => this.log.error(e.message));
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
              /* Update state immediately so other requests use the latest settings */
              this.state.color.s = saturation;

              await updateClientColor();
              return callback(null, get(this.state, 'color.s', 100));
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
          /* Trigger read that will be reported later by internalUpdate */
          this.client.getColorXY(this.device).catch(e => this.log.error(e.message));
          return callback(null, get(this.state, 'color.s', 100));
        } else {
          return callback(new Error('Device is offline'));
        }
      });

    this.service
      .getCharacteristic(Characteristic.Brightness)
      .on(
        CharacteristicEventTypes.SET,
        async (brightnessPercent: number, callback: CharacteristicSetCallback) => {
          try {
            if (this.isOnline) {
              /* Update state immediately so other requests use the latest settings */
              this.state.brightness_percent = brightnessPercent;

              Object.assign(
                this.state,
                await this.client.setBrightnessPercent(this.device, brightnessPercent)
              );
              return callback(null, get(this.state, 'brightness_percent', 100));
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
          /* Trigger read that will be reported later by internalUpdate */
          this.client.getBrightnessPercent(this.device).catch(e => this.log.error(e.message));
          return callback(null, get(this.state, 'brightness_percent', 100));
        } else {
          return callback(new Error('Device is offline'));
        }
      });

    return this;
  }

  private withSaturation(): LighbulbServiceBuilder {
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
          this.client.getSaturation(this.device).catch(e => this.log.error(e.message));
          callback(null, get(this.state, 'color.s', 100));
        } else {
          return callback(new Error('Device is offline'));
        }
      });

    return this;
  }
}
