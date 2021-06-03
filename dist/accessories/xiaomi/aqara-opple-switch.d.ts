import { PlatformAccessory, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { DeviceState } from '../../zigbee/types';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { ZigBeeAccessory } from '../zig-bee-accessory';
export declare enum EventType {
    SINGLE = 0,
    DOUBLE = 1,
    HOLD = 2
}
interface Action {
    switchService: Service;
    eventType: EventType;
}
interface Button {
    index: number;
    displayName: string;
    subType: string;
}
declare abstract class AqaraOppleSwitch extends ZigBeeAccessory {
    protected services: Service[];
    protected buttons: Button[];
    protected withBattery: boolean;
    getAvailableServices(): Service[];
    update(state: DeviceState): void;
    protected parseAction(actionString: string): Action | null;
}
export declare class AqaraOppleSwitch2Buttons extends AqaraOppleSwitch {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device);
}
export declare class AqaraOppleSwitch4Buttons extends AqaraOppleSwitch {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device);
}
export declare class AqaraOppleSwitch6Buttons extends AqaraOppleSwitch {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device);
}
export {};
//# sourceMappingURL=aqara-opple-switch.d.ts.map