import { PlatformConfig } from 'homebridge';

/**
 * Supported services for manually configured devices
 */
export type ServiceType =
  | 'contact-sensor'
  | 'bulb' // lights, switches and dimmers
  | 'motion-sensor'
  | 'leak-sensor' // to use with water, gas or smoke sensors
  | 'vibration-sensor'
  | 'battery'
  | 'humidity-sensor'
  | 'temperature-sensor'
  | 'outlet';

/**
 * Service definition for a configured device. Your device should at least define one service.
 */
export interface ServiceConfig {
  type: ServiceType;
  meta?: {
    colorTemp?: boolean; // light temperature control
    batteryLow?: boolean; // battery low warning
    colorXY?: boolean; // XY light color control
    brightness?: boolean; // brightness control
    hue?: boolean; // hue control
    saturation?: boolean; // saturation control
    power?: boolean; // consumption information (Wh)
    voltage?: boolean; // consumption information (a)
    current?: boolean; // consumption information (mWh)
    waterLeak?: boolean; // water leak detection
    gasLeak?: boolean; // gas leak detection
    smokeLeak?: boolean; // smoke leak detection
    tamper?: boolean; // tampered status detection
  };
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
}
