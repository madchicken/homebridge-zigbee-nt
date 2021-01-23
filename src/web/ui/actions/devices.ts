import { handleError } from './utils';
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

export class DevicesService {
  static async fetchDevices(): Promise<DeviceResponse> {
    try {
      const response = await fetch('/api/devices');
      if (response.ok) {
        const json = await response.json();
        return {
          result: 'success',
          devices: json.devices,
          total: json.devices.length,
        };
      } else {
        return handleError(await response.text());
      }
    } catch (e) {
      return handleError(e.message);
    }
  }

  static async fetchDevice(ieeeAddr: string): Promise<DeviceResponse> {
    try {
      const response = await fetch(`/api/devices/${ieeeAddr}`);
      if (response.ok) {
        const json = await response.json();
        return {
          result: 'success',
          device: json.device,
        };
      } else {
        return handleError(await response.text());
      }
    } catch (e) {
      return handleError(e.message);
    }
  }

  static async deleteDevice(ieeeAddr: string): Promise<DeviceResponse> {
    try {
      const response = await fetch(`/api/devices/${ieeeAddr}`, {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
      });
      if (response.ok) {
        const json = await response.json();
        return {
          result: 'success',
          device: json.device,
        };
      } else {
        return handleError(await response.text());
      }
    } catch (e) {
      return handleError(e.message);
    }
  }

  static async getDeviceState(ieeeAddr: string, state: DeviceState): Promise<StateResponse> {
    try {
      const response = await fetch(`/api/devices/${ieeeAddr}/get`, {
        method: 'POST',
        body: JSON.stringify(state),
        headers: {
          'content-type': 'application/json',
        },
      });
      if (response.ok) {
        const json = await response.json();
        return {
          result: 'success',
          state: json.state,
        };
      } else {
        return handleError(await response.text());
      }
    } catch (e) {
      return handleError(e.message);
    }
  }

  static async setDeviceState(ieeeAddr: string, state: DeviceState): Promise<StateResponse> {
    try {
      const response = await fetch(`/api/devices/${ieeeAddr}/set`, {
        method: 'POST',
        body: JSON.stringify(state),
        headers: {
          'content-type': 'application/json',
        },
      });
      if (response.ok) {
        const json = await response.json();
        return {
          result: 'success',
          state: json.state,
        };
      } else {
        return handleError(await response.text());
      }
    } catch (e) {
      return handleError(e.message);
    }
  }
}
