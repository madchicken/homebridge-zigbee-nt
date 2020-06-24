import { ZigBee, ZigBeeDevice } from './zigbee';
import { Logger } from 'homebridge';
import Endpoint from 'zigbee-herdsman/dist/controller/model/endpoint';
import { createStore, Store } from './utils/state-manager';
import { normalizeBrightness } from './utils/color-fn';

type State = 'ON' | 'OFF' | 'TOGGLE';

export interface JsonPayload {
  state?: State;
  brightness?: number; // Value between 0 and 255
  brightness_percent?: number; // 0-100
  // Color temperature in Reciprocal MegaKelvin, a.k.a. Mirek scale.
  // Mirek = 1,000,000 / Color Temperature in Kelvin
  // Values typically between 50 and 400. The higher the value, the warmer the color.
  color_temp?: number;
  color?: {
    // RGB color
    hue?: number;
    s?: number;
    x?: number;
    y?: number;

    r?: number;
    g?: number;
    b?: number;
  };
  // Blinks the bulbs, possible values:
  // - "select": single blink
  // - "lselect": blinking for a longer time
  // - "none": stop blinking
  alert?: 'select' | 'lselect' | 'none';
  temperature?: number;
  humidity?: number;
}

interface Meta {
  endpoint_name: string;
  options: any;
  message: JsonPayload;
  logger: Logger;
  device: ZigBeeDevice;
  mapped: any;
  state: any;
}

interface Converter {
  key: string[];
  convertSet?: (entity, key: string, value: string, meta: Meta) => Promise<any>;
  convertGet?: (entity, key: string, meta: Meta) => Promise<any>;
}

export interface ColorCapabilities {
  colorTemperature: boolean;
  colorXY: boolean;
}

export enum ActionType {
  set = 'set',
  get = 'get',
}

export class ZigBeeClient {
  private readonly zigBee: ZigBee;
  private readonly log: Logger;
  private readonly store: Store<string, JsonPayload>;

  constructor(zigBee: ZigBee, log: Logger) {
    this.zigBee = zigBee;
    this.log = log;
    this.store = createStore<string, JsonPayload>();
  }

  async sendMessage(
    entityKey: ZigBeeDevice,
    action: ActionType,
    json: JsonPayload,
    deviceState: JsonPayload = {}
  ): Promise<Endpoint> {
    const resolvedEntity = this.zigBee.resolveEntity(entityKey);

    if (!resolvedEntity) {
      this.log.error(`Entity '${entityKey}' is unknown`);
      return;
    }
    const entries: [string, keyof JsonPayload][] = Object.entries(json);
    const sorter = json.state === 'OFF' ? 1 : -1;
    entries.sort(a =>
      ['state', 'brightness', 'brightness_percent'].includes(a[0]) ? sorter : sorter * -1
    );

    const usedConverters = [];
    for (let [key, value] of entries) {
      const device = resolvedEntity.device;
      const definition = resolvedEntity.definition;
      const target = resolvedEntity.endpoint;
      const converters: Converter[] = resolvedEntity.definition.toZigbee;
      const converter = converters.find(c => c.key.includes(key));

      if (!converter) {
        throw new Error(`No converter available for '${key}' (${json[key]})`);
      }

      if (usedConverters.includes(converter)) {
        // Use a converter only once (e.g. light_onoff_brightness converters can convert state and brightness)
        continue;
      }

      let actualTarget = target;

      // Converter didn't return a result, skip
      const meta: Meta = {
        endpoint_name: action,
        options: {}, // FIXME: handle options
        message: json,
        logger: this.log,
        device,
        mapped: definition,
        state: deviceState,
      };

      try {
        if (action === 'set' && converter.convertSet) {
          this.log.debug(`Publishing '${action}' '${key}' to '${resolvedEntity.name}'`);
          const result = await converter.convertSet(actualTarget, key, value, meta);
          this.log.debug('Result from zigbee (SET)', result);

          // It's possible for devices to get out of sync when writing an attribute that's not reportable.
          // So here we re-read the value after a specified timeout, this timeout could for example be the
          // transition time of a color change or for forcing a state read for devices that don't
          // automatically report a new state when set.
          // When reporting is requested for a device (report: true in device-specific settings) we won't
          // ever issue a read here, as we assume the device will properly report changes.
          // Only do this when the retrieve_state option is enabled for this device.
          return actualTarget;
        } else if (action === 'get' && converter.convertGet) {
          this.log.debug(
            `Publishing get '${action}' '${key}' to '${resolvedEntity.name}'`,
            converter
          );
          await converter.convertGet(actualTarget, key, meta);
          this.log.debug('Result from zigbee (GET)', actualTarget.clusters);
          return actualTarget;
        }
      } catch (error) {
        const message = `Publish '${action}' '${key}' to '${resolvedEntity.name}' failed: '${error}'`;
        this.log.error(message);
        this.log.debug(error.stack);
      }
      usedConverters.push(converter);
    }
  }

  async setOn(device: ZigBeeDevice, on: boolean): Promise<JsonPayload> {
    await this.sendMessage(device, ActionType.set, { state: on ? 'ON' : 'OFF' });
    return { state: on ? 'ON' : 'OFF' };
  }

  async getOnOffState(device: ZigBeeDevice, force: boolean = false): Promise<JsonPayload> {
    const on = await this.getClusterAttribute(device, 'genOnOff', 'onOff', force);
    return { state: on === 1 ? 'ON' : 'OFF' };
  }

  async getColorXY(device: ZigBeeDevice, force: boolean = false): Promise<JsonPayload> {
    const x =
      ((await this.getClusterAttribute(device, 'lightingColorCtrl', 'currentX', force)) as number) /
      10000;
    const y =
      ((await this.getClusterAttribute(device, 'lightingColorCtrl', 'currentY', force)) as number) /
      10000;

    return { color: { x, y } };
  }

  async getBrightnessPercent(device: ZigBeeDevice, force: boolean = false): Promise<JsonPayload> {
    const z = (await this.getClusterAttribute(
      device,
      'genLevelCtrl',
      'currentLevel',
      force
    )) as number;
    const brightness_percent = normalizeBrightness(z);
    return { brightness_percent };
  }

  async getColorCapabilities(
    device: ZigBeeDevice,
    force: boolean = false
  ): Promise<ColorCapabilities> {
    const colorCapabilities = (await this.getClusterAttribute(
      device,
      'lightingColorCtrl',
      'colorCapabilities',
      force
    )) as number;

    return {
      colorTemperature: (colorCapabilities & (1 << 4)) > 0,
      colorXY: (colorCapabilities & (1 << 3)) > 0,
    };
  }

  async getClusterAttribute(
    device: ZigBeeDevice,
    cluster: string,
    attribute: string,
    force: boolean = false
  ): Promise<string | number> {
    const resolvedEntity = this.zigBee.resolveEntity(device);
    const endpoint = resolvedEntity.endpoint;
    if (endpoint.getClusterAttributeValue(cluster, attribute) === undefined || force) {
      await endpoint.read(cluster, [attribute]);
    }
    return endpoint.getClusterAttributeValue(cluster, attribute);
  }

  async getSaturation(device: ZigBeeDevice, force: boolean = false): Promise<JsonPayload> {
    const s = (await this.getClusterAttribute(
      device,
      'lightingColorCtrl',
      'currentSaturation',
      force
    )) as number;
    return { color: { s } };
  }

  async getHue(device: ZigBeeDevice, force: boolean = false): Promise<JsonPayload> {
    const hue = (await this.getClusterAttribute(
      device,
      'lightingColorCtrl',
      'currentHue',
      force
    )) as number;
    return { color: { hue } };
  }

  async setHue(device: ZigBeeDevice, hue: number) {
    await this.sendMessage(device, ActionType.set, { color: { hue } });
    return this.getHue(device);
  }

  async setColorXY(device: ZigBeeDevice, x: number, y: number) {
    await this.sendMessage(device, ActionType.set, { color: { x, y } });
    return this.getColorXY(device);
  }

  async setColorRGB(device: ZigBeeDevice, r: number, g: number, b: number) {
    await this.sendMessage(device, ActionType.set, { color: { r, g, b } });
    return this.getColorXY(device);
  }
}
