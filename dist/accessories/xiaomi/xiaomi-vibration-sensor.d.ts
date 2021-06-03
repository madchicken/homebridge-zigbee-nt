import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
export declare class XiaomiVibrationSensor extends ZigBeeAccessory {
    private contactService;
    private batteryService;
    getAvailableServices(): Service[];
    update(state: DeviceState): void;
}
//# sourceMappingURL=xiaomi-vibration-sensor.d.ts.map