import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
export declare class GledoptoDim extends ZigBeeAccessory {
    protected lightbulbService: Service;
    getAvailableServices(): Service[];
    handleAccessoryIdentify(): Promise<void>;
}
//# sourceMappingURL=gledopto-dim.d.ts.map