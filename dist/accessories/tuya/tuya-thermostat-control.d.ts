import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { ZigBeeAccessory } from '../zig-bee-accessory';
export declare class TuyaThermostatControl extends ZigBeeAccessory {
    private thermostatService;
    getAvailableServices(): Service[];
    update(state: DeviceState): void;
}
//# sourceMappingURL=tuya-thermostat-control.d.ts.map