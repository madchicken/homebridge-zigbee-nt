import { Logger, PlatformAccessory, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState, ZigBeeDefinition, ZigBeeEntity } from '../zigbee/types';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { ConfigurableAccessory } from './configurable-accessory';
export interface ZigBeeAccessoryCtor {
    new (platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device): ZigBeeAccessory;
}
export declare type ZigBeeAccessoryFactory = (platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device) => ConfigurableAccessory;
export declare abstract class ZigBeeAccessory {
    readonly ieeeAddr: string;
    protected platform: ZigbeeNTHomebridgePlatform;
    protected log: Logger;
    protected accessory: PlatformAccessory;
    protected readonly client: ZigBeeClient;
    protected state: DeviceState;
    protected readonly entity: ZigBeeEntity;
    private missedPing;
    private isConfiguring;
    private interval;
    private mappedServices;
    isOnline: boolean;
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device);
    /**
     * Perform initialization of the accessory. By default is creates services exposed by the
     * accessory by invoking {@link ZigBeeAccessory.getAvailableServices}
     */
    initialize(): Promise<void>;
    handleAccessoryIdentify(): void;
    get zigBeeDeviceDescriptor(): Device;
    get zigBeeDefinition(): ZigBeeDefinition;
    get friendlyName(): string;
    abstract getAvailableServices(): Service[];
    onDeviceMount(): void;
    private getPollingInterval;
    ping(): Promise<void>;
    configureDevice(): Promise<boolean>;
    private get isConfigured();
    private set isConfigured(value);
    private shouldConfigure;
    internalUpdate(state: DeviceState): void;
    /**
     * This function handles most of the characteristics update you need.
     * Override this function only if you need some specific update feature for your accessory
     * @param state DeviceState Current device state
     */
    update(state: DeviceState): void;
    private handleButtonAction;
    supports(property: string): boolean;
}
//# sourceMappingURL=zig-bee-accessory.d.ts.map