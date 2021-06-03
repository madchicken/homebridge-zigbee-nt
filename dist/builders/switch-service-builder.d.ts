import { ServiceBuilder } from './service-builder';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { DeviceState } from '../zigbee/types';
export declare class SwitchServiceBuilder extends ServiceBuilder {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    withOnOff(): SwitchServiceBuilder;
}
//# sourceMappingURL=switch-service-builder.d.ts.map