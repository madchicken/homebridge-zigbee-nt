import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState } from '../zigbee/types';
import { SensorServiceBuilder } from './sensor-service-builder';
export declare class ContactSensorServiceBuilder extends SensorServiceBuilder {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    withContact(): ContactSensorServiceBuilder;
    withVibration(): ContactSensorServiceBuilder;
}
//# sourceMappingURL=contact-sensor-service-builder.d.ts.map