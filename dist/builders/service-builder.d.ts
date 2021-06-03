import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { Logger, PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState } from '../zigbee/types';
import { Device } from 'zigbee-herdsman/dist/controller/model';
export declare abstract class ServiceBuilder {
    protected readonly client: ZigBeeClient;
    protected readonly accessory: PlatformAccessory;
    protected readonly platform: ZigbeeNTHomebridgePlatform;
    protected readonly state: DeviceState;
    protected service: Service;
    protected constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    get device(): Device;
    get log(): Logger;
    build(): Service;
    get Characteristic(): typeof import("homebridge").Characteristic;
    get isOnline(): boolean;
    get friendlyName(): string;
}
//# sourceMappingURL=service-builder.d.ts.map