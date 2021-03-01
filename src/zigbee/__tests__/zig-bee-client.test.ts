import * as fs from 'fs';
import { Logging } from 'homebridge';
import { LogLevel } from 'homebridge/lib/logger';
import Database from 'zigbee-herdsman/dist/controller/database';
import { MessagePayload } from 'zigbee-herdsman/dist/controller/events';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { getDevice } from '../../utils/tests/device-builder';
import { ZigBeeClient } from '../zig-bee-client';

const log: Logging = (() => {
  const l = (_message: string, ..._parameters: any[]): void => {};

  return Object.assign(l, {
    prefix: 'none',
    info: function(_message: string, ..._parameters: any[]): void {},
    warn: function(_message: string, ..._parameters: any[]): void {},
    error: function(_message: string, ..._parameters: any[]): void {},
    debug: function(_message: string, ..._parameters: any[]): void {},
    log: function(_level: LogLevel, _message: string, ..._parameters: any[]): void {},
  }) as Logging;
})();

const dbPath = `${__dirname}/test.db`;

describe('ZigBee Client', () => {
  let db: Database;

  beforeEach(() => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    db = Database.open(dbPath);
    Device.injectDatabase(db);
  });

  afterEach(() => {
    fs.unlinkSync(dbPath);
  });

  it('should decode a message from IKEA ON/OFF button', () => {
    const device: Device = getDevice('ikeaOnOffButton');
    const message: MessagePayload = {
      type: 'commandOff',
      device: device,
      endpoint: device.endpoints[0],
      data: {},
      linkquality: 7,
      groupID: 901,
      cluster: 'genOnOff',
      meta: {
        zclTransactionSequenceNumber: 41,
      },
    };
    const client = new ZigBeeClient(log);
    const callback = jest.fn();
    client.decodeMessage(message, callback);
    expect(callback).toBeCalledTimes(1);
    expect(callback).toBeCalledWith(device.ieeeAddr, { click: 'off', action: 'off' });
  });
});
