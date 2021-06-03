import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState } from '../zigbee/types';
export declare class ProgrammableSwitchServiceBuilder {
    protected readonly client: ZigBeeClient;
    protected readonly accessory: PlatformAccessory;
    protected readonly platform: ZigbeeNTHomebridgePlatform;
    protected readonly state: DeviceState;
    protected readonly services: Service[];
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    withStatelessSwitch(displayName: string, subType: string, index: number, supportedActions?: number[]): ProgrammableSwitchServiceBuilder;
    build(): Service[];
}
//# sourceMappingURL=programmable-switch-service-builder.d.ts.map