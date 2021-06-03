import { Logger } from 'homebridge';
import { MessagePayload } from 'zigbee-herdsman/dist/controller/events';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import { CustomDeviceSetting } from '../types';
import { ColorCapabilities, DeviceState, SystemMode, ZigBeeEntity } from './types';
export interface ZigBeeClientConfig {
    channel: number;
    port?: string;
    database: string;
    panId: number;
    secondaryChannel?: string;
    adapter?: 'zstack' | 'deconz' | 'zigate';
}
declare type StatePublisher = (ieeeAddr: string, state: DeviceState) => void;
export declare class ZigBeeClient {
    private readonly zigBee;
    private readonly deviceSettingsMap;
    private readonly log;
    constructor(log: Logger, customDeviceSettings?: CustomDeviceSetting[]);
    start(config: ZigBeeClientConfig): Promise<boolean>;
    resolveEntity(device: Device): ZigBeeEntity;
    private getDeviceSetting;
    decodeMessage(message: MessagePayload, callback: StatePublisher): void;
    private readDeviceState;
    private writeDeviceState;
    /**
     * Creates a map of key => converter to use when talking with the dongle
     * @param keys an array of keys we want to extract
     * @param definition the zigbee definition of the device
     * @private
     */
    private mapConverters;
    private getKeys;
    interview(ieeeAddr: string): Promise<Device>;
    setOnState(device: Device, on: boolean): Promise<DeviceState>;
    getOnOffState(device: Device): Promise<DeviceState>;
    setLockState(device: Device, on: boolean): Promise<DeviceState>;
    getLockState(device: Device): Promise<DeviceState>;
    getPowerState(device: Device): Promise<DeviceState>;
    getCurrentState(device: Device): Promise<DeviceState>;
    getVoltageState(device: Device): Promise<DeviceState>;
    getColorXY(device: Device): Promise<DeviceState>;
    getBrightnessPercent(device: Device): Promise<DeviceState>;
    setBrightnessPercent(device: Device, brightnessPercent: number): Promise<DeviceState>;
    getColorCapabilities(device: Device, force?: boolean): Promise<ColorCapabilities>;
    getClusterAttribute(device: Device, cluster: string, attribute: string, force?: boolean): Promise<string | number>;
    getSaturation(device: Device): Promise<DeviceState>;
    getHue(device: Device): Promise<DeviceState>;
    setHue(device: Device, hue: number): Promise<DeviceState>;
    setColorXY(device: Device, x: number, y: number): Promise<DeviceState>;
    setColorRGB(device: Device, r: number, g: number, b: number): Promise<DeviceState>;
    getLocalTemperature(device: Device): Promise<DeviceState>;
    setCurrentHeatingSetpoint(device: Device, temperature: number): Promise<DeviceState>;
    setSystemMode(device: Device, state: SystemMode): Promise<DeviceState>;
    getSystemMode(device: Device): Promise<DeviceState>;
    getTemperature(device: Device): Promise<DeviceState>;
    getHumidity(device: Device): Promise<Partial<DeviceState>>;
    getCoordinator(): Device;
    identify(device: Device): Promise<DeviceState>;
    setSaturation(device: Device, saturation: number): Promise<DeviceState>;
    getColorTemperature(device: Device): Promise<DeviceState>;
    setColorTemperature(device: Device, colorTemperature: number): Promise<DeviceState>;
    setLeftButtonOn(device: Device, on: boolean): Promise<DeviceState>;
    setRightButtonOn(device: Device, on: boolean): Promise<DeviceState>;
    getAllPairedDevices(): Device[];
    getDevice(ieeeAddr: string): any;
    permitJoin(value: boolean): Promise<void>;
    getPermitJoin(): Promise<boolean>;
    stop(): Promise<void>;
    touchlinkFactoryReset(): Promise<boolean>;
    unpairDevice(ieeeAddr: string): Promise<boolean>;
    on(message: string, listener: (...args: any[]) => void): void;
    toggleLed(state: boolean): Promise<void>;
    ping(ieeeAddr: string): Promise<any>;
    setCustomState(device: Device, state: DeviceState): Promise<DeviceState>;
    getState(device: Device, state: DeviceState): Promise<DeviceState>;
    getCoordinatorVersion(): Promise<any>;
    isUpdateFirmwareAvailable(device: Device, request?: {}): Promise<boolean>;
    updateFirmware(device: Device, onProgress: (percentage: number, remaining: number) => void): Promise<void>;
    hasOTA(device: Device): boolean;
    private bindOrUnbind;
    bind(sourceId: string, targetId: string, clusters: string[]): Promise<{
        successfulClusters: any[];
        failedClusters: any[];
    }>;
    unbind(sourceId: string, targetId: string, clusters: string[]): Promise<{
        successfulClusters: any[];
        failedClusters: any[];
    }>;
}
export {};
//# sourceMappingURL=zig-bee-client.d.ts.map