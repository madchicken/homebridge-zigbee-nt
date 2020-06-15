import { endpointNames, ZigBee, ZigBeeDevice } from './zigbee';
import { Logger } from 'homebridge';
import { findByDevice, toZigbeeConverters } from 'zigbee-herdsman-converters';
import Endpoint from 'zigbee-herdsman/dist/controller/model/endpoint';

const groupConverters = [
  toZigbeeConverters.light_onoff_brightness,
  toZigbeeConverters.light_colortemp,
  toZigbeeConverters.light_color,
  toZigbeeConverters.light_alert,
  toZigbeeConverters.ignore_transition,
  toZigbeeConverters.cover_position_tilt,
  toZigbeeConverters.thermostat_occupied_heating_setpoint,
  toZigbeeConverters.tint_scene,
  toZigbeeConverters.light_brightness_move,
];

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

export class ZigBeeClient {
  private readonly zigBee: ZigBee;
  private readonly log: Logger;

  constructor(zigBee: ZigBee, log: Logger) {
    this.zigBee = zigBee;
    this.log = log;
  }

  async sendMessage(entityKey: any, action: string, json: JsonPayload): Promise<Endpoint> {
    const resolvedEntity = this.zigBee.resolveEntity(entityKey);

    if (!resolvedEntity) {
      this.log.error(`Entity '${entityKey}' is unknown`);
      return;
    }

    // Get entity details
    let converters: Converter[] = null;
    let target = null;
    let options = {};
    let device = null;
    let definition = null;

    if (resolvedEntity.type === 'device') {
      if (!resolvedEntity.definition) {
        this.log.warn(`Device with modelID '${resolvedEntity.device.modelID}' is not supported.`);
        this.log.warn(
          `Please see: https://github.com/madchicken/homebridge-zigbee-nt/wiki/How-to-support-new-devices`
        );
        return;
      }

      device = resolvedEntity.device;
      definition = resolvedEntity.definition;
      target = resolvedEntity.endpoint;
      converters = resolvedEntity.definition.toZigbee;
    } else {
      converters = groupConverters;
      target = resolvedEntity.group;
      definition = resolvedEntity.group.members.map(e => findByDevice(e.getDevice()));
    }

    /**
     * Order state & brightness based on current bulb state
     *
     * Not all bulbs support setting the color/color_temp while it is off
     * this results in inconsistent behavior between different vendors.
     *
     * bulb on => move state & brightness to the back
     * bulb off => move state & brightness to the front
     */
    const entries: [string, keyof JsonPayload][] = Object.entries(json);
    const sorter = json.state === 'OFF' ? 1 : -1;
    entries.sort(a =>
      ['state', 'brightness', 'brightness_percent'].includes(a[0]) ? sorter : sorter * -1
    );

    let [key, value] = entries[0]; // exec just the first operation
    let endpointName: string = action;
    let actualTarget = target;

    // When the key has a endpointName included (e.g. state_right), this will override the target.
    if (resolvedEntity.type === 'device' && key.includes('_')) {
      const underscoreIndex = key.lastIndexOf('_');
      const possibleEndpointName = key.substring(underscoreIndex + 1, key.length);
      if (endpointNames.includes(possibleEndpointName)) {
        endpointName = possibleEndpointName;
        key = key.substring(0, underscoreIndex);
        const device = target.getDevice();
        actualTarget = device.getEndpoint(definition.endpoint(device)[endpointName]);
      }
    }

    const converter = converters.find(c => c.key.includes(key));

    if (!converter) {
      throw new Error(`No converter available for '${key}' (${json[key]})`);
    }

    // Converter didn't return a result, skip
    const meta: Meta = {
      endpoint_name: endpointName,
      options: options || {},
      message: json,
      logger: this.log,
      device,
      mapped: definition,
      state: {},
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
      } else {
        throw new Error(`No converter available for '${action}' '${key}' (${json[key]})`);
      }
    } catch (error) {
      const message = `Publish '${action}' '${key}' to '${resolvedEntity.name}' failed: '${error}'`;
      this.log.error(message);
      this.log.debug(error.stack);
      throw error;
    }
  }
}
