import { IkeaTradfriDim } from './ikea-tradfri-dim';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { PlatformAccessory } from 'homebridge';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';
export declare class IkeaTradfriDimColortemp extends IkeaTradfriDim {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device);
    getAvailableServices(): import("homebridge").Service[];
}
//# sourceMappingURL=ikea-tradfri-dim-colortemp.d.ts.map