import { Characteristic, PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { ButtonAction, Options } from './zigbee/types';

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
export type ServiceType =
  | 'unknown'
  | 'contact-sensor'
  | 'light-sensor'
  | 'bulb' // for backward compatibility
  | 'light-bulb' // lights and dimmers
  | 'switch' // switches and dimmers
  | 'programmable-switch' // multi buttons
  | 'motion-sensor'
  | 'leak-sensor' // to use with water, gas or smoke sensors
  | 'vibration-sensor'
  | 'battery'
  | 'humidity-sensor'
  | 'temperature-sensor'
  | 'outlet'
  | 'lock'
  | 'thermostat'; // thermostats

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

export interface CustomDeviceSetting extends Options {
  ieeeAddr: string;
}

export interface ZigBeeNTPlatformConfig extends PlatformConfig {
  name: string;
  port?: string;
  panId?: number;
  channel?: number;
  secondaryChannel?: string;
  database?: string;
  adapter?: 'zstack' | 'deconz' | 'zigate' | 'ezsp';
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
