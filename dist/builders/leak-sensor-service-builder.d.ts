import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState } from '../zigbee/types';
import { SensorServiceBuilder } from './sensor-service-builder';
export declare class LeakSensorServiceBuilder extends SensorServiceBuilder {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    withWaterLeak(): LeakSensorServiceBuilder;
    withGasLeak(): LeakSensorServiceBuilder;
    withSmokeLeak(): LeakSensorServiceBuilder;
}
//# sourceMappingURL=leak-sensor-service-builder.d.ts.map