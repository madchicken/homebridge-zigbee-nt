import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
export declare class IkeaShurtcutSwitch extends ZigBeeAccessory {
    protected switchServiceOn: Service;
    protected batteryService: Service;
    getAvailableServices(): Service[];
    update(state: DeviceState): void;
}
//# sourceMappingURL=ikea-shurtcut-switch.d.ts.map