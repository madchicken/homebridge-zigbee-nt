import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
export declare class IkeaRemoteSwitch extends ZigBeeAccessory {
    protected switchServiceToggle: Service;
    protected switchServiceBrightUp: Service;
    protected switchServiceBrightDown: Service;
    protected switchServiceLeft: Service;
    protected switchServiceRight: Service;
    protected batteryService: Service;
    getAvailableServices(): Service[];
    update(state: DeviceState): void;
}
//# sourceMappingURL=ikea-remote-switch.d.ts.map