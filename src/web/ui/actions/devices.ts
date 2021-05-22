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
    const response = await fetch('/api/devices');
    if (response.ok) {
      const json = await response.json();
      return {
        result: 'success',
        devices: json.devices,
        total: json.devices.length,
      };
    } else {
      throw new Error(await response.text());
    }
  }

  static async fetchDevice(ieeeAddr: string): Promise<DeviceResponse> {
    const response = await fetch(`/api/devices/${ieeeAddr}`);
    if (response.ok) {
      const json = await response.json();
      return {
        result: 'success',
        device: json.device,
      };
    } else {
      throw new Error(await response.text());
    }
  }

  static async deleteDevice(ieeeAddr: string): Promise<DeviceResponse> {
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
      throw new Error(await response.text());
    }
  }

  static async getDeviceState(ieeeAddr: string, state: DeviceState): Promise<StateResponse> {
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
      throw new Error(await response.text());
    }
  }

  static async setDeviceState(ieeeAddr: string, state: DeviceState): Promise<StateResponse> {
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
      throw new Error(await response.text());
    }
  }

  static async pingDevice(ieeeAddr: string): Promise<StateResponse> {
    const response = await fetch(`/api/devices/${ieeeAddr}/ping`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (response.ok) {
      const json = await response.json();
      return {
        result: 'success',
        state: json,
      };
    } else {
      throw new Error(await response.text());
    }
  }

  static async unbind(ieeeAddr: string, target: string, clusters: string[]) {
    const response = await fetch(`/api/devices/${ieeeAddr}/unbind`, {
      method: 'POST',
      body: JSON.stringify({ target, clusters }),
      headers: {
        'content-type': 'application/json',
      },
    });
    if (response.ok) {
      const json = await response.json();
      return {
        result: 'success',
        state: json,
      };
    } else {
      throw new Error(await response.text());
    }
  }

  static async checkForUpdates(ieeeAddr: string): Promise<boolean> {
    const response = await fetch(`/api/devices/${ieeeAddr}/checkForUpdates`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (response.ok) {
      const json = await response.json();
      if (json.newFirmwareAvailable === 'YES') {
        return true;
      } else if (json.newFirmwareAvailable === 'NO') {
        return false;
      } else {
        throw new Error(`Failed to determine updates status: ${JSON.stringify(json)}`)
      }
    } else {
      throw new Error(await response.text());
    }
  }
}
