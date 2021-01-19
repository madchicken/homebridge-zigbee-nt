import { MessagePayload } from 'zigbee-herdsman/dist/controller/events';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import Endpoint from 'zigbee-herdsman/dist/controller/model/endpoint';
import { Zcl } from 'zigbee-herdsman';
import { Logger } from 'homebridge';

type State = 'ON' | 'OFF' | 'TOGGLE';

export interface ZigBeeControllerConfig {
  port?: string;
  panId?: number;
  channels: number[];
  databasePath: string;
  adapter: 'zstack' | 'deconz' | 'zigate';
}

export interface DeviceState {
  state?: State;
  state_left?: State;
  state_right?: State;
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
  click?:
    | 'on'
    | 'off'
    | 'brightness_down'
    | 'brightness_up'
    | 'play_pause'
    | 'single'
    | 'double'
    | 'hold'
    | 'release';
  state_l1?: 'ON' | 'OFF' | 'TOGGLE';
  state_l2?: 'ON' | 'OFF' | 'TOGGLE';
  battery?: number;
  current?: number;
  power?: number;
  voltage?: number;
  illuminance?: number;
  illuminance_lux?: number;
  contact?: boolean;
  action?:
    | 'on'
    | 'toggle'
    | 'toggle_hold'
    | 'toggle_release'
    | 'arrow_left_click'
    | 'arrow_left_hold'
    | 'arrow_left_release'
    | 'arrow_right_click'
    | 'arrow_right_hold'
    | 'arrow_right_release'
    | 'brightness_up_click'
    | 'brightness_up_hold'
    | 'brightness_up_release'
    | 'brightness_down_click'
    | 'brightness_down_hold'
    | 'brightness_down_release'
    | 'brightness_move_down'
    | 'brightness_move_up'
    | 'brightness_stop'
    | 'vibration'
    | 'tilt'
    | 'button_1_hold'
    | 'button_2_hold'
    | 'button_3_hold'
    | 'button_4_hold'
    | 'button_5_hold'
    | 'button_6_hold'
    | 'button_1_release'
    | 'button_2_release'
    | 'button_3_release'
    | 'button_4_release'
    | 'button_5_release'
    | 'button_6_release'
    | 'button_1_single'
    | 'button_2_single'
    | 'button_3_single'
    | 'button_4_single'
    | 'button_5_single'
    | 'button_6_single'
    | 'button_1_double'
    | 'button_2_double'
    | 'button_3_double'
    | 'button_4_double'
    | 'button_5_double'
    | 'button_6_double'
    | 'drop'
    | 'single'
    | 'hold'
    | 'double';
  occupancy?: boolean;
  tamper?: boolean;
  battery_low?: boolean;
  strength?: number;
  linkquality?: number;
  sensitivity?: 'low' | 'medium' | 'high';
  water_leak?: boolean;
  gas?: boolean;
  smoke?: boolean;
  // Philips HUE specifics
  hue_power_on_behavior?: 'default' | 'on' | 'off' | 'recover';
  hue_power_on_brightness?: number;
  hue_power_on_color_temperature?: number;
  hue_power_on_color?: string;
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

interface Capability {
  type: string;
  name: string;
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
    configured?: number;
  };
  configure?: (device: Device, coordinatorEndpoint: Endpoint) => Promise<void>;
  fromZigbee: FromConverter[];
  toZigbee: ToConverter[];
  exposes: Capability[];

  [key: string]: any;
}

export interface ZigBeeEntity {
  type: 'device' | 'group';
  group?: any;
  device?: Device;
  endpoint?: Endpoint;
  definition?: ZigBeeDefinition;
  name: string;
  settings: any;
}
