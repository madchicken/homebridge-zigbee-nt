import { ZigBee, ZigBeeDevice } from './zigbee';
import { Logger } from 'homebridge';
import Endpoint from 'zigbee-herdsman/dist/controller/model/endpoint';

export interface JsonPayload {
  state?: 'ON' | 'OFF' | 'TOGGLE';
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

export type ActionType = 'set' | 'get';

export class ZigBeeClient {
  private readonly zigBee: ZigBee;
  private readonly log: Logger;

  constructor(zigBee: ZigBee, log: Logger) {
    this.zigBee = zigBee;
    this.log = log;
  }

  async sendMessage(
    entityKey: any,
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

  async getColorCapabilities(entityKey: any) {
    const resolvedEntity = this.zigBee.resolveEntity(entityKey);
    const endpoint = resolvedEntity.endpoint;

    if (endpoint.getClusterAttributeValue('lightingColorCtrl', 'colorCapabilities') === undefined) {
      await endpoint.read('lightingColorCtrl', ['colorCapabilities']);
    }

    const value = Number(
      endpoint.getClusterAttributeValue('lightingColorCtrl', 'colorCapabilities')
    );
    return {
      colorTemperature: (value & (1 << 4)) > 0,
      colorXY: (value & (1 << 3)) > 0,
    };
  }
}
