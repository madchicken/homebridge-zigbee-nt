import { ZigbeeNTHomebridgePlatform } from '../platform';
import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
export declare class PermitJoinAccessory {
    private inProgress;
    private readonly platform;
    readonly accessory: PlatformAccessory;
    private switchService;
    private zigBeeClient;
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, zigBeeClient: ZigBeeClient);
    handleAccessoryIdentify(): void;
    setPermitJoin(value: boolean): Promise<void>;
    private handleGetSwitchOn;
    private handleSetSwitchOn;
}
//# sourceMappingURL=permit-join-accessory.d.ts.map