import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
export declare class PhilipsHueWhite extends ZigBeeAccessory {
    private lightbulbService;
    getAvailableServices(): Service[];
    handleAccessoryIdentify(): Promise<void>;
}
//# sourceMappingURL=philips-hue-white.d.ts.map