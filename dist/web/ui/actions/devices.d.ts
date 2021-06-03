import { DeviceState } from '../../../zigbee/types';
import { DeviceModel } from '../../common/types';
export interface BaseResponse {
    result: 'success' | 'error';
    error?: string;
}
export interface DeviceResponse extends BaseResponse {
    devices?: DeviceModel[];
    device?: DeviceModel;
    total?: number;
}
export interface StateResponse extends BaseResponse {
    state?: DeviceState;
}
export declare class DevicesService {
    static fetchDevices(): Promise<DeviceResponse>;
    static fetchDevice(ieeeAddr: string): Promise<DeviceResponse>;
    static deleteDevice(ieeeAddr: string): Promise<DeviceResponse>;
    static getDeviceState(ieeeAddr: string, state: DeviceState): Promise<StateResponse>;
    static setDeviceState(ieeeAddr: string, state: DeviceState): Promise<StateResponse>;
    static pingDevice(ieeeAddr: string): Promise<StateResponse>;
    static unbind(ieeeAddr: string, target: string, clusters: string[]): Promise<{
        result: string;
        state: any;
    }>;
    static checkForUpdates(ieeeAddr: string): Promise<{
        result: string;
        state: any;
    }>;
}
//# sourceMappingURL=devices.d.ts.map