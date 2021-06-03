import { Characteristic, PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { ButtonAction, DeviceSetting } from './zigbee/types';
export interface FakegatoEntry {
    time: number;
    power: number;
}
export interface FakegatoHistoryService extends Service {
    addEntry(config: FakegatoEntry): any;
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
export declare enum ServiceType {
    UNKNOWN = "unknown",
    CONTACT_SENSOR = "contact-sensor",
    LIGHT_SENSOR = "light-sensor",
    BULB = "bulb",
    LIGHT_BULB = "light-bulb",
    SWITCH = "switch",
    PROGRAMMABLE_SWITCH = "programmable-switch",
    MOTION_SENSOR = "motion-sensor",
    LEAK_SENSOR = "leak-sensor",
    VIBRATION_SENSOR = "vibration-sensor",
    BATTERY = "battery",
    HUMIDITY_SENSOR = "humidity-sensor",
    TEMPERATURE_SENSOR = "temperature-sensor",
    OUTLET = "outlet",
    LOCK = "lock",
    THERMOSTAT = "thermostat",
    COVER = "cover"
}
export declare type HKButtonAction = 'SINGLE_PRESS' | 'DOUBLE_PRESS' | 'LONG_PRESS';
export declare type ButtonActionMapping = {
    [k in ButtonAction]: HKButtonAction;
};
export declare type ButtonsMapping = {
    [k: string]: ButtonActionMapping;
};
export declare type ServiceMeta = {
    colorTemp?: boolean;
    batteryLow?: boolean;
    colorXY?: boolean;
    colorHS?: boolean;
    brightness?: boolean;
    power?: boolean;
    voltage?: boolean;
    current?: boolean;
    waterLeak?: boolean;
    gasLeak?: boolean;
    smokeLeak?: boolean;
    tamper?: boolean;
    vibration?: boolean;
    contact?: boolean;
    localTemperature?: boolean;
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
//# sourceMappingURL=types.d.ts.map