import { API, Characteristic, DynamicPlatformPlugin, Logger, PlatformAccessory, Service } from 'homebridge';
import { ZigBeeAccessory } from './accessories/zig-bee-accessory';
import { ZigBeeClient } from './zigbee/zig-bee-client';
import { DeviceInterviewPayload, DeviceJoinedPayload, DeviceLeavePayload } from 'zigbee-herdsman/dist/controller/events';
import { ZigBeeNTPlatformConfig } from './types';
export declare class ZigbeeNTHomebridgePlatform implements DynamicPlatformPlugin {
    readonly log: Logger;
    readonly config: ZigBeeNTPlatformConfig;
    readonly api: API;
    readonly Service: typeof Service;
    readonly Characteristic: typeof Characteristic;
    private readonly accessories;
    private readonly homekitAccessories;
    private permitJoinAccessory;
    readonly PlatformAccessory: typeof PlatformAccessory;
    private client;
    private httpServer;
    private touchLinkAccessory;
    constructor(log: Logger, config: ZigBeeNTPlatformConfig, api: API);
    get zigBeeClient(): ZigBeeClient;
    startZigBee(): Promise<void>;
    stopZigbee(): Promise<void>;
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory): void;
    handleZigBeeDevInterview(message: DeviceInterviewPayload): Promise<void>;
    handleZigBeeDevJoined(message: DeviceJoinedPayload): Promise<boolean>;
    private handleDeviceUpdate;
    generateUUID(ieeeAddr: string): string;
    handleZigBeeDevLeaving(message: DeviceLeavePayload): Promise<boolean>;
    handleZigBeeReady(): Promise<void>;
    getAccessoryByIeeeAddr(ieeeAddr: string): PlatformAccessory;
    getAccessoryByUUID(uuid: string): PlatformAccessory;
    getHomekitAccessoryByIeeeAddr(ieeeAddr: string): ZigBeeAccessory;
    getHomekitAccessoryByUUID(uuid: string): ZigBeeAccessory;
    private initDevice;
    private mountDevice;
    private initPermitJoinAccessory;
    private initTouchLinkAccessory;
    private createHapAccessory;
    private removeAccessory;
    unpairDevice(ieeeAddr: string): Promise<boolean>;
    private handleDeviceAnnounce;
    private handleZigBeeMessage;
    getDeviceFriendlyName(ieeeAddr: string): string;
    isDeviceOnline(ieeeAddr: string): boolean;
}
//# sourceMappingURL=platform.d.ts.map