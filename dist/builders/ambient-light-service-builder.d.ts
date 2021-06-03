import { ServiceBuilder } from './service-builder';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { DeviceState } from '../zigbee/types';
export declare class AmbientLightServiceBuilder extends ServiceBuilder {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    withAmbientLightLevel(): AmbientLightServiceBuilder;
}
//# sourceMappingURL=ambient-light-service-builder.d.ts.map