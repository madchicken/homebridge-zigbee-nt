import { PlatformConfig } from 'homebridge';

export type ServiceType = 'contact-sensor' | 'bulb' | 'motion-sensor';

export interface ExposedService {
  type: ServiceType;
  meta: {
    colorTemp?: boolean;
    batteryLow?: boolean;
    colorXY?: boolean;
    brightness?: boolean;
  };
}

export interface DeviceConfig {
  manufacturer: string;
  models: string[];
  exposedServices: ExposedService[];
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
  devices?: DeviceConfig[];
}
