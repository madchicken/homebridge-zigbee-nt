import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
export declare class InnrWhite extends ZigBeeAccessory {
    private lightbulbService;
    getAvailableServices(): Service[];
    handleAccessoryIdentify(): Promise<void>;
}
//# sourceMappingURL=innr-white.d.ts.map