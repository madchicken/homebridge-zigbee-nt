import { Characteristic, PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { ButtonAction, DeviceSetting } from './zigbee/types';

export interface FakegatoEntry {
  time: number;
  power: number;
}

export interface FakegatoHistoryService extends Service {
  addEntry(config: FakegatoEntry);
}

export interface FakegatoService {
  new (type: string, plugin: PlatformAccessory, config: any): FakegatoHistoryService;
}

export interface ExtraHAPTypes {
  Service: typeof Service;
  Characteristic: typeof Characteristic;
  PlatformAccessory: typeof PlatformAccessory;
  CurrentPowerConsumption: any;
  TotalConsumption: any;
  CurrentVoltage: any;
  CurrentConsumption: any;
  FakeGatoHistoryService: FakegatoService;
}

/**
 * Supported services for manually configured devices
 */
export enum ServiceType {
  UNKNOWN = 'unknown',
  CONTACT_SENSOR = 'contact-sensor',
  LIGHT_SENSOR = 'light-sensor',
  BULB = 'bulb', // for backward compatibility
  LIGHT_BULB = 'light-bulb', // lights and dimmers
  SWITCH = 'switch', // switches and dimmers
  PROGRAMMABLE_SWITCH = 'programmable-switch', // multi buttons
  MOTION_SENSOR = 'motion-sensor',
  LEAK_SENSOR = 'leak-sensor', // to use with water, gas or smoke sensors
  VIBRATION_SENSOR = 'vibration-sensor',
  BATTERY = 'battery',
  HUMIDITY_SENSOR = 'humidity-sensor',
  TEMPERATURE_SENSOR = 'temperature-sensor',
  OUTLET = 'outlet',
  LOCK = 'lock',
  THERMOSTAT = 'thermostat', // thermostats
  COVER = 'cover',
};

export type HKButtonAction = 'SINGLE_PRESS' | 'DOUBLE_PRESS' | 'LONG_PRESS';

export type ButtonActionMapping = {
  [k in ButtonAction]: HKButtonAction;
};

/*
  Defines a mapping for a button, like this:
  {
    'button_1': {
      'button_1_click': 'SINGLE_PRESS',
      'button_1_hold': 'LONG_PRESS'
      'button_1_double': 'DOUBLE_PRESS'
    },
    'button_2': {
      'button_2_click': 'SINGLE_PRESS',
      'button_2_hold': 'LONG_PRESS'
      'button_2_double': 'DOUBLE_PRESS'
    }
  }
 */
export type ButtonsMapping = {
  [k: string]: ButtonActionMapping;
};

export type ServiceMeta = {
  colorTemp?: boolean; // light temperature control
  batteryLow?: boolean; // battery low warning
  colorXY?: boolean; // XY light color control
  colorHS?: boolean; // HS light color control
  brightness?: boolean; // brightness control
  power?: boolean; // consumption information (Wh)
  voltage?: boolean; // consumption information (a)
  current?: boolean; // consumption information (mWh)
  waterLeak?: boolean; // water leak detection
  gasLeak?: boolean; // gas leak detection
  smokeLeak?: boolean; // smoke leak detection
  tamper?: boolean; // tampered status detection
  vibration?: boolean; // vibration sensor
  contact?: boolean; // simple contact sensor
  localTemperature?: boolean; // thermostat local temperature
  currentHeatingSetpoint?: number[];
  buttonsMapping?: ButtonsMapping;
};

/**
 * Service definition for a configured device. Your device should at least define one service.
 */
export interface ServiceConfig {
  type: ServiceType;
  meta?: ServiceMeta;
}

/**
 * Interface to define a device using simple configuration.
 * It muse provide manufacturer and models as reported by your device amd at least one {@link ServiceConfig}
 */
export interface DeviceConfig {
  manufacturer: string;
  models: string[];
  services: ServiceConfig[];
}

export interface CustomDeviceSetting extends DeviceSetting {
  ieeeAddr: string;
}

export interface ZigBeeNTPlatformConfig extends PlatformConfig {
  name: string;
  port?: string;
  panId?: number;
  channel?: number;
  secondaryChannel?: string;
  database?: string;
  adapter?: 'zstack' | 'deconz' | 'zigate';
  httpPort?: number;
  disableRoutingPolling?: boolean;
  disableHttpServer?: boolean;
  routerPollingInterval?: number;
  enablePermitJoin?: boolean;
  devices?: DeviceConfig[];
  customDeviceSettings?: CustomDeviceSetting[];
  preferAutoDiscover?: boolean;
}

export interface WSEvent {
  [k: string]: any;
}
