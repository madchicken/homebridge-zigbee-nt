import { sleep } from './sleep';
import { ZigBee } from '../zigbee/zigbee';
import Timeout = NodeJS.Timeout;
import { Logger } from 'homebridge';

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

export class RouterPolling {
  private readonly log: Logger;
  private pollingTimeout: Timeout;
  readonly interval: number;
  private readonly zigBee: ZigBee;

  constructor(zigBee: ZigBee, log: Logger, interval: number) {
    this.zigBee = zigBee;
    this.log = log;
    this.interval = interval * 1000 || DEFAULT_POLL_INTERVAL;
    if (this.interval < MIN_POLL_INTERVAL || this.interval > MAX_POLL_INTERVAL) {
      this.interval = DEFAULT_POLL_INTERVAL;
    }
  }

  start() {
    this.log.info(`Starting router polling with ${this.interval}ms interval`);
    this.stop();
    this.pollingTimeout = setTimeout(async () => {
      const devices = this.zigBee.list().filter(isDeviceRouter);
      const promises = devices.map(async device => {
        try {
          if (this.log) {
            this.log.debug(
              `[RouterPolling] ping device: ${device.ieeeAddr} ${device.manufacturerName}: ${device.modelID}`
            );
          }
          await this.zigBee.ping(device.ieeeAddr);
          return sleep(1000);
        } catch (e) {
          this.log.error(
            `[RouterPolling] ping device error: ${device.ieeeAddr} ${device.manufacturerName}: ${device.modelID}`,
            e
          );
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      this.pollingTimeout.refresh();
    }, this.interval);
  }

  stop() {
    clearTimeout(this.pollingTimeout);
    this.pollingTimeout = null;
  }
}
