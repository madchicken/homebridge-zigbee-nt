import { PlatformAccessory, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { DeviceState } from '../../zigbee/types';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { ZigBeeAccessory } from '../zig-bee-accessory';
declare abstract class AqaraCurtainMotorGeneral extends ZigBeeAccessory {
    protected services: Service[];
    protected buttons: [];
    protected withBattery: boolean;
    getAvailableServices(): Service[];
    update(state: DeviceState): void;
}
export declare class AqaraCurtainMotor extends AqaraCurtainMotorGeneral {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device);
}
export {};
//# sourceMappingURL=aqara-curtain-motor.d.ts.map