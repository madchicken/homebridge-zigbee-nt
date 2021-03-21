import { MessagePayload } from 'zigbee-herdsman/dist/controller/events';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import Endpoint from 'zigbee-herdsman/dist/controller/model/endpoint';
import { Zcl } from 'zigbee-herdsman';
import { Logger } from 'homebridge';

type State = '' | 'ON' | 'OFF' | 'TOGGLE' | 'LOCK' | 'UNLOCK';
export type SystemMode = 'off' | 'heat' | 'cool' | 'auto';

export interface ZigBeeControllerConfig {
  port?: string;
  panId?: number;
  channels: number[];
  databasePath: string;
  adapter: 'zstack' | 'deconz' | 'zigate';
}

export type RunningState = 'idle' | 'heat' | 'cool';

export type ButtonAction =
  | 'on'
  | 'off'
  | 'toggle'
  | 'toggle_hold'
  | 'toggle_release'
  | 'arrow_left_click'
  | 'arrow_left_hold'
  | 'arrow_left_release'
  | 'arrow_right_click'
  | 'arrow_right_hold'
  | 'arrow_right_release'
  | 'brightness_down'
  | 'brightness_up'
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
  | 'button_1_click'
  | 'button_2_click'
  | 'button_3_click'
  | 'button_4_click'
  | 'button_5_click'
  | 'button_6_click'
  | 'drop'
  | 'single'
  | 'hold'
  | 'double'
  | 'play_pause'
  | 'release'
  | 'single_left'
  | 'single_right'
  | 'single_both'
  | 'double_left'
  | 'double_right'
  | 'double_both'
  | 'hold_left'
  | 'hold_right'
  | 'hold_both';

export type ClickAction =
  | 'on'
  | 'off'
  | 'brightness_down'
  | 'brightness_up'
  | 'play_pause'
  | 'single'
  | 'double'
  | 'hold'
  | 'release';

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
  local_temperature?: number;
  current_heating_setpoint?: number;
  system_mode?: SystemMode;
  running_state?: RunningState;
  humidity?: number;
  click?: ClickAction;
  state_l1?: 'ON' | 'OFF' | 'TOGGLE';
  state_l2?: 'ON' | 'OFF' | 'TOGGLE';
  lock_state?: '' | 'not_fully_locked' | 'locked' | 'unlocked';
  battery?: number;
  current?: number;
  power?: number;
  voltage?: number;
  illuminance?: number;
  illuminance_lux?: number;
  contact?: boolean;
  action?: ButtonAction;
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

export interface DeviceSetting {
  friendlyName?: string;
  legacy?: boolean;
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
    options: DeviceSetting,
    meta: Meta
  ) => Partial<DeviceState>;
}

enum AccessType {
  STATE = 1,
  SET = 2,
  STATE_SET = 3,
  STATE_GET = 5,
  ALL = 7,
}

export type Value = string | boolean | number;
export type CapabilityType =
  | 'light'
  | 'switch'
  | 'cover'
  | 'fan'
  | 'lock'
  | 'climate'
  | 'composite'
  | 'binary'
  | 'numeric'
  | 'enum'
  | 'text';

export interface Capability {
  type: CapabilityType;
  name: string;
  features: Feature[];
}

export interface Feature {
  type: CapabilityType;
  name: string;
  property?: string;
  access?: AccessType;
  value_on?: Value;
  value_off?: Value;
  values?: Value[];
  value_toggle?: Value;
  value_max?: number;
  value_min?: number;
  value_step?: number;
  features?: Feature[];
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
  interviewing?: boolean;
  fingerprint?: [{ modelID: string; manufacturerName: string }];
  ota?: {
    isUpdateAvailable: (
      device: Device,
      logger: Logger,
      requestPayload?: {
        imageType?: number;
        manufacturerCode?: number;
        fileVersion?: number;
        fieldControl?: number;
      }
    ) => Promise<boolean>;
    updateToLatest: (
      device: Device,
      logger: Logger,
      onProgress: (percentage: number, remaining: number) => void
    ) => Promise<void>;
    useTestURL?: () => void;
  };
}

export interface ZigBeeEntity {
  type: 'device' | 'group' | 'group_number';
  ID?: number; // used in groups
  group?: any;
  device?: Device;
  endpoint?: Endpoint;
  definition?: ZigBeeDefinition;
  name: string;
  settings: DeviceSetting;
}

export interface BindInfo {
  from: string;
  to: string;
  clusters?: string[];
}

export interface RawDevice {
  readonly ID: number;
  _applicationVersion?: string;
  _dateCode?: string;
  _endpoints: Endpoint[];
  _hardwareVersion?: string;
  _ieeeAddr: string;
  _interviewCompleted: boolean;
  _interviewing: boolean;
  _lastSeen: number;
  _manufacturerID?: string;
  _manufacturerName?: string;
  _modelID?: string;
  _networkAddress: number;
  _powerSource?: string;
  _softwareBuildID?: string;
  _stackVersion?: string;
  _type?: string;
  _zclVersion?: string;
  _linkquality?: string;
  _skipDefaultResponse: boolean;
}
