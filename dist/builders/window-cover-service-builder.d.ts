import { ServiceBuilder } from './service-builder';
import { PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { DeviceState } from '../zigbee/types';
export declare class WindowCoverServiceBuilder extends ServiceBuilder {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    /**
     * Handle requests to get the current value of the "Current Position" characteristic
     */
    handleCurrentPositionGet(): number;
    /**
     * Handle requests to get the current value of the "Position State" characteristic
     */
    handlePositionStateGet(): 1 | 0;
    /**
     * Handle requests to get the current value of the "Target Position" characteristic
     */
    handleTargetPositionGet(): number;
    /**
     * Handle requests to set the "Target Position" characteristic
     */
    handleTargetPositionSet(value: any): void;
}
//# sourceMappingURL=window-cover-service-builder.d.ts.map