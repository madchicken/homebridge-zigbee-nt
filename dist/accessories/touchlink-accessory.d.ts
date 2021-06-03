import { ZigbeeNTHomebridgePlatform } from '../platform';
import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
export declare class TouchlinkAccessory {
    private inProgress;
    private readonly log;
    private readonly platform;
    readonly accessory: PlatformAccessory;
    private switchService;
    private zigBee;
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, zigBee: ZigBeeClient);
    handleAccessoryIdentify(): void;
    handleGetSwitchOn(callback: any): void;
    handleSetSwitchOn(_value: boolean, callback: any): void;
}
//# sourceMappingURL=touchlink-accessory.d.ts.map