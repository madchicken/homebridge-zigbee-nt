import { PlatformConfig } from 'homebridge';

export type ServiceType =
  | 'contact-sensor'
  | 'bulb'
  | 'motion-sensor'
  | 'leak-sensor' // to use with water, gas or smoke sensors
  | 'vibration-sensor'
  | 'battery'
  | 'humidity-sensor'
  | 'temperature-sensor'
  | 'outlet';

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
  };
}

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
  httpPort?: number;
  disableRoutingPolling?: boolean;
  disableHttpServer?: boolean;
  routerPollingInterval?: number;
  enablePermitJoin?: boolean;
  devices?: DeviceConfig[];
}
