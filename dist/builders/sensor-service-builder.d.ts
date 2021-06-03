import { ServiceBuilder } from './service-builder';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { DeviceState } from '../zigbee/types';
import { WithUUID } from 'hap-nodejs';
export declare abstract class SensorServiceBuilder extends ServiceBuilder {
    constructor(service: WithUUID<typeof Service>, platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    withBatteryLow(): this;
    withTamper(): this;
}
//# sourceMappingURL=sensor-service-builder.d.ts.map