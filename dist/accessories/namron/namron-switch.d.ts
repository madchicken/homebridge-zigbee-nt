import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
export declare class NamronSwitch extends ZigBeeAccessory {
    protected service: Service;
    getAvailableServices(): Service[];
    handleAccessoryIdentify(): Promise<void>;
}
//# sourceMappingURL=namron-switch.d.ts.map