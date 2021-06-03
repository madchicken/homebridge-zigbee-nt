import { ServiceBuilder } from './service-builder';
import { PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { DeviceState } from '../zigbee/types';
export declare const LOW_BATTERY_THRESHOLD = 10;
export declare class BatteryServiceBuilder extends ServiceBuilder {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    /**
     * Expose a service with battery percentage and notification when the battery level
     * goes under {@link LOW_BATTERY_THRESHOLD}
     */
    withBatteryPercentage(): BatteryServiceBuilder;
}
//# sourceMappingURL=battery-service-builder.d.ts.map