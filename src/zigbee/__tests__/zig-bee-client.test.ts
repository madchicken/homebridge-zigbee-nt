import * as fs from 'fs';
import Database from 'zigbee-herdsman/dist/controller/database';
import { MessagePayload } from 'zigbee-herdsman/dist/controller/events';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { getDevice } from '../../utils/tests/device-builder';
import { log } from '../../utils/tests/null-logger';
import { ZigBeeClient } from '../zig-bee-client';

const dbPath = `${__dirname}/tmp-test.db`; // must point to a tmp file

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

  it('should decode a message from IKEA ON/OFF button', async () => {
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
    await client.init({ port: 'foo', 'channel': 11, database: dbPath, adapter: 'zstack', panId: 1 });
    const callback = jest.fn();
    client.decodeMessage(message, callback);
    expect(callback).toBeCalledTimes(1);
    expect(callback).toBeCalledWith(device.ieeeAddr, { click: 'off', action: 'off' });
  });
});
