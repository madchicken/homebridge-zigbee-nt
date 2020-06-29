import { MessagePayload } from 'zigbee-herdsman/dist/controller/events';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import Endpoint from 'zigbee-herdsman/dist/controller/model/endpoint';
import { Zcl } from 'zigbee-herdsman';
import { Logger } from 'homebridge';

type State = 'ON' | 'OFF' | 'TOGGLE';

export interface DeviceState {
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

    rgb?: string;
  };
  // Blinks the bulbs, possible values:
  // - "select": single blink
  // - "lselect": blinking for a longer time
  // - "none": stop blinking
  alert?: 'select' | 'lselect' | 'none';
  temperature?: number;
  humidity?: number;
}

export interface ColorCapabilities {
  colorTemperature: boolean;
  colorXY: boolean;
}

export enum ActionType {
  set = 'set',
  get = 'get',
}

export interface Options {
  manufacturerCode?: number;
  disableDefaultResponse?: boolean;
  disableResponse?: boolean;
  timeout?: number;
  direction?: Zcl.Direction;
  srcEndpoint?: number;
  reservedBits?: number;
  transactionSequenceNumber?: number;
}

export interface Meta {
  endpoint_name?: string;
  options?: Options;
  message?: DeviceState;
  logger?: Logger;
  device: Device;
  mapped?: any;
  state?: any;
}

interface ConverterResult {
  state: DeviceState;
  readAfterWriteTime?: number;
  linkquality?: number;
}

export interface ToConverter {
  key: string[];
  convertSet?: (
    entity: Endpoint,
    key: string,
    value: string,
    meta: Meta
  ) => Promise<ConverterResult>;
  convertGet?: (entity: Endpoint, key: string, meta?: Meta) => Promise<void>;
}

export interface FromConverter {
  cluster: string;
  type: string | string[];
  convert: (
    model,
    message: MessagePayload,
    publish: (...args) => void,
    options: any,
    meta: Meta
  ) => Partial<DeviceState>;
}

export interface ZigBeeDefinition {
  zigbeeModel: string[];
  model: string;
  vendor: string;
  description: string;
  supports?: string;
  meta?: {
    supportsHueAndSaturation?: boolean;
    configureKey?: number;
    disableDefaultResponse?: boolean;
    applyRedFix?: boolean;
    enhancedHue?: boolean;
    multiEndpoint?: boolean;
    timeout?: number;
  };
  configure?: (device: Device, coordinatorEndpoint: Endpoint) => Promise<void>;
  fromZigbee: FromConverter[];
  toZigbee: ToConverter[];

  [key: string]: any;
}

export interface ZigBeeEntity {
  type: 'device' | 'group';
  group?: any;
  device?: Device;
  endpoint?: Endpoint;
  definition?: ZigBeeDefinition;
  name: string;
}
