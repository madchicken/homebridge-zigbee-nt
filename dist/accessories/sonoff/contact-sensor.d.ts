import { Service } from 'homebridge';
import { ZigBeeAccessory } from '../zig-bee-accessory';
export declare class SonoffContactSensor extends ZigBeeAccessory {
    private contactService;
    private batteryService;
    getAvailableServices(): Service[];
}
//# sourceMappingURL=contact-sensor.d.ts.map