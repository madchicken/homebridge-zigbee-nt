import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
export declare class IkeaTradfriDim extends ZigBeeAccessory {
    protected lightbulbService: Service;
    getAvailableServices(): Service[];
    handleAccessoryIdentify(): Promise<void>;
}
//# sourceMappingURL=ikea-tradfri-dim.d.ts.map