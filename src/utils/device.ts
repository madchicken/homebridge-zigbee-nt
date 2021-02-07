export const DEFAULT_POLL_INTERVAL = 30 * 1000;
export const MIN_POLL_INTERVAL = 10 * 1000;
export const MAX_POLL_INTERVAL = 120 * 1000;

export function isDeviceRouter(device) {
  let power = 'unknown';
  if (device.powerSource) {
    power = device.powerSource.toLowerCase().split(' ')[0];
  }
  if (power !== 'battery' && power !== 'unknown' && device.type === 'Router') {
    return true;
  }
}
