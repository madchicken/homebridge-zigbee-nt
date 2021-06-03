import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
export declare class NamronDimmer extends ZigBeeAccessory {
    protected lightbulbService: Service;
    getAvailableServices(): Service[];
    handleAccessoryIdentify(): Promise<void>;
}
//# sourceMappingURL=namron-dimmer.d.ts.map