import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceBuilder } from './service-builder';
import { DeviceState } from '../zigbee/types';
export declare class LighbulbServiceBuilder extends ServiceBuilder {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    withOnOff(): LighbulbServiceBuilder;
    withBrightness(): LighbulbServiceBuilder;
    withColorTemperature(): LighbulbServiceBuilder;
    private withHue;
    /**
     * Special treatment for bulbs supporting HS color
     * HomeKit only knows about HSB, so we need to manually convert values
     */
    withColorHS(): LighbulbServiceBuilder;
    /**
     * Special treatment for bulbs supporting only XY colors (IKEA Tådfri for example)
     * HomeKit only knows about HSB, so we need to manually convert values
     */
    withColorXY(): LighbulbServiceBuilder;
    private withSaturation;
}
//# sourceMappingURL=lighbulb-service-builder.d.ts.map