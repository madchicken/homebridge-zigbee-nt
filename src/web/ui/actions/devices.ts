import { handleError } from './utils';
import { DeviceState } from '../../../zigbee/types';

export interface BaseResponse {
  result: 'success' | 'error';
  error?: string;
}

export type Endpoint = {
  ID: number;
  profileID: number;
  deviceID: number;
  inputClusters: number[];
  outputClusters: number[];
  deviceNetworkAddress: number;
  deviceIeeeAddress: string;
  clusters: {
    [k: string]: {
      attributes: any;
    };
  };
  _binds: any[];
  meta: any;
};

export type DeviceModel = {
  type: string;
  ieeeAddr: string;
  networkAddress: number;
  manufacturerID: string;
  manufacturerName: string;
  powerSource: string;
  modelID: string;
  interviewCompleted: boolean;
  lastSeen: number;
  softwareBuildID: string;
  endpoints?: Endpoint[];
};

export interface DeviceResponse extends BaseResponse {
  devices?: DeviceModel[];
  device?: DeviceModel;
  total?: number;
}

export interface StateResponse extends BaseResponse {
  state?: DeviceState;
}

export function normalizeDeviceModel(d): DeviceModel {
  return {
    type: d._type,
    ieeeAddr: d._ieeeAddr,
    networkAddress: d._networkAddress,
    manufacturerID: d._manufacturerID,
    manufacturerName: d._manufacturerName,
    powerSource: d._powerSource,
    modelID: d._modelID,
    interviewCompleted: d._interviewCompleted,
    softwareBuildID: d._softwareBuildID,
    lastSeen: d._lastSeen,
    endpoints: d._endpoints,
  };
}

export class DevicesService {
  static async fetchDevices(): Promise<DeviceResponse> {
    try {
      const response = await fetch('/api/devices');
      if (response.ok) {
        const json = await response.json();
        return {
          result: 'success',
          devices: json.devices.map(normalizeDeviceModel),
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
          device: normalizeDeviceModel(json.device),
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
      });
      if (response.ok) {
        const json = await response.json();
        return {
          result: 'success',
          device: normalizeDeviceModel(json.device),
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
