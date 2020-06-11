import { sleep } from './sleep';
import { ZigBee } from '../zigbee';
import Timeout = NodeJS.Timeout;
import { Logger } from 'homebridge';

const DEFAULT_POLL_INTERVAL = 60 * 1000;

function isDeviceRouter(device) {
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
  private pollingInterval: Timeout;
  private readonly interval: number;
  private readonly zigBee: ZigBee;

  constructor(zigBee: ZigBee, log: Logger, interval: number = DEFAULT_POLL_INTERVAL) {
    this.zigBee = zigBee;
    this.log = log;
    this.interval = interval;
  }

  start() {
    this.stop();
    this.pollingInterval = setInterval(() => {
      const devices = this.zigBee.list().filter(isDeviceRouter);
      devices.reduce(
        (promise, device) =>
          promise.then(() => {
            if (this.log) {
              this.log.debug(`[RouterPolling] ping device: ${device.ieeeAddr}`);
            }
            this.zigBee.ping(device.ieeeAddr);
            return sleep(1000);
          }),
        Promise.resolve()
      );
    }, this.interval);
  }

  stop() {
    clearInterval(this.pollingInterval);
    this.pollingInterval = null;
  }
}
