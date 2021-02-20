import { PlatformConfig } from 'homebridge';
import { DeviceSetting } from './zigbee/types';

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
  | 'motion-sensor'
  | 'leak-sensor' // to use with water, gas or smoke sensors
  | 'vibration-sensor'
  | 'battery'
  | 'humidity-sensor'
  | 'temperature-sensor'
  | 'outlet'
  | 'lock'
  | 'thermostat'; // thermostats

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
