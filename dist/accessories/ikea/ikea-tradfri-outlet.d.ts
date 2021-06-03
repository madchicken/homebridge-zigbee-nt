import { ZigBeeAccessory } from '../zig-bee-accessory';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';
export declare class IkeaTradfriOutlet extends ZigBeeAccessory {
    private service;
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device);
    getAvailableServices(): Service[];
}
//# sourceMappingURL=ikea-tradfri-outlet.d.ts.map