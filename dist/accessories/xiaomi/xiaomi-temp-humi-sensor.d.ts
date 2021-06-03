import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
export declare class XiaomiTempHumiSensor extends ZigBeeAccessory {
    private temperatureService;
    private humidityService;
    private batteryService;
    getAvailableServices(): Service[];
}
//# sourceMappingURL=xiaomi-temp-humi-sensor.d.ts.map