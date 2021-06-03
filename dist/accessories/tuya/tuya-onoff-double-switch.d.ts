import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
export declare class TuyaOnoffDoubleSwitch extends ZigBeeAccessory {
    protected switchServiceButtonLeft: Service;
    protected switchServiceButtonRight: Service;
    getAvailableServices(): Service[];
    update(state: DeviceState): void;
}
//# sourceMappingURL=tuya-onoff-double-switch.d.ts.map