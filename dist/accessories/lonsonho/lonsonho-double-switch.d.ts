import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
export declare class LonsonhoDoubleSwitch extends ZigBeeAccessory {
    protected switch1ServiceOn: Service;
    protected switch1ServiceOff: Service;
    protected switch2ServiceOn: Service;
    protected switch2ServiceOff: Service;
    getAvailableServices(): Service[];
    update(state: DeviceState): void;
}
//# sourceMappingURL=lonsonho-double-switch.d.ts.map