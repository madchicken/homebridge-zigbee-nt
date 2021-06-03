import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
export declare class NanoleafIvy extends ZigBeeAccessory {
    protected lightbulbService: Service;
    getAvailableServices(): Service[];
    handleAccessoryIdentify(): Promise<void>;
}
//# sourceMappingURL=nanoleaf-ivy.d.ts.map