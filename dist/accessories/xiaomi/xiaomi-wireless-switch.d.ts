import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
export declare class XiaomiWirelessSwitch extends ZigBeeAccessory {
    protected switchService: Service;
    protected batteryService: Service;
    getAvailableServices(): Service[];
    update(state: DeviceState): void;
}
//# sourceMappingURL=xiaomi-wireless-switch.d.ts.map