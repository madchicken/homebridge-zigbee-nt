import { DeviceResponse } from './devices';

export function handleError(message: string): DeviceResponse {
  return {
    result: 'error',
    error: message,
    devices: null,
  };
}
