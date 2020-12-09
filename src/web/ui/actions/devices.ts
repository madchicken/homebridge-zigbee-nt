import { Device } from 'zigbee-herdsman/dist/controller/model';
import { AnyAction, Dispatch } from 'redux';
import { ACTIONS } from '../reducers/device';

export interface BaseResponse {
  result: 'success' | 'error';
  error?: string;
}

export interface DeviceResponse extends BaseResponse {
  devices: Device[];
  total?: number;
}

export async function fetchDevicesFromAPI(): Promise<DeviceResponse> {
  try {
    const response = await fetch('/api/devices');
    const json = await response.json();
    return { result: 'success', devices: json.devices, total: json.devices.length };
  } catch (e) {
    // eslint-disable-next-line no-undef
    console.error(e);
    return {
      result: 'error',
      error: e.message,
      devices: null,
    };
  }
}

export async function fetchDevices(dispatch: Dispatch<AnyAction>) {
  try {
    dispatch({
      type: ACTIONS.FIND_ALL_RECORDS.REQUEST,
    });
    const devices = await fetchDevicesFromAPI();
    dispatch({
      type: ACTIONS.FIND_ALL_RECORDS.SUCCESS,
      payload: devices,
    });
  } catch (e) {
    dispatch({
      type: ACTIONS.FIND_ALL_RECORDS.ERROR,
      payload: e,
    });
  }
}
