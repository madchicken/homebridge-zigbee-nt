import { handleError } from './utils';

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
  endpoints?: Endpoint[];
};

export interface DeviceResponse extends BaseResponse {
  devices?: DeviceModel[];
  device?: DeviceModel;
  total?: number;
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

  static async fetchDevice(ieeAddr: string): Promise<DeviceResponse> {
    try {
      const response = await fetch(`/api/devices/${ieeAddr}`);
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

  static async deleteDevice(ieeAddr: string): Promise<DeviceResponse> {
    try {
      const response = await fetch(`/api/devices/${ieeAddr}`, {
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
}
