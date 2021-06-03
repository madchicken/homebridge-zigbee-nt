import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';
import { DeviceState } from '../zigbee/types';
export declare class OutletServiceBuilder extends ServiceBuilder {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    withOnOff(): OutletServiceBuilder;
    withPower(): OutletServiceBuilder;
    withVoltage(): OutletServiceBuilder;
    withCurrent(): OutletServiceBuilder;
    build(): Service;
}
//# sourceMappingURL=outlet-service-builder.d.ts.map