export interface BaseResponse {
  result: 'success' | 'error';
  error?: string;
}

export type DeviceModel = {
  type: string;
  ieeeAddr: string;
  networkAddress: number;
  manufacturerID: string;
  manufacturerName: string;
  powerSource: string;
  modelID: string;
  interviewCompleted: boolean;
  endpoints?: any[];
};

export interface DeviceResponse extends BaseResponse {
  devices?: DeviceModel[];
  device?: DeviceModel;
  total?: number;
}

function normalizeModel(d) {
  return {
    type: d._type,
    ieeeAddr: d._ieeeAddr,
    networkAddress: d._networkAddress,
    manufacturerID: d._manufacturerID,
    manufacturerName: d._manufacturerName,
    powerSource: d._powerSource,
    modelID: d._modelID,
    interviewCompleted: d._interviewCompleted,
  };
}

function handleError(message: string): DeviceResponse {
  return {
    result: 'error',
    error: message,
    devices: null,
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
          devices: json.devices.map(normalizeModel),
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
          device: normalizeModel(json.device),
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
          device: normalizeModel(json.device),
        };
      } else {
        return handleError(await response.text());
      }
    } catch (e) {
      return handleError(e.message);
    }
  }
}
