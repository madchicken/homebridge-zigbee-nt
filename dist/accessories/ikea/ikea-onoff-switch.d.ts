import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
export declare class IkeaOnoffSwitch extends ZigBeeAccessory {
    protected switchServiceOn: Service;
    protected switchServiceOff: Service;
    protected batteryService: Service;
    getAvailableServices(): Service[];
    update(state: DeviceState): void;
}
//# sourceMappingURL=ikea-onoff-switch.d.ts.map