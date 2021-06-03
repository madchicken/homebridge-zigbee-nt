import { PlatformAccessory, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceConfig } from '../types';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { ZigBeeAccessory } from './zig-bee-accessory';
/**
 * Generic device accessory builder
 */
export declare class ConfigurableAccessory extends ZigBeeAccessory {
    readonly accessoryConfig: ServiceConfig[];
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device, config: ServiceConfig[]);
    getAvailableServices(): Service[];
}
//# sourceMappingURL=configurable-accessory.d.ts.map