import { HomebridgeAPI } from 'homebridge/lib/api';
import Database from 'zigbee-herdsman/dist/controller/database';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ZigBeeNTPlatformConfig } from '../types';
import { log } from '../utils/tests/null-logger';
import { findByDevice } from 'zigbee-herdsman-converters';

// Mocks
jest.mock('../zigbee/zig-bee-client', () => {
  return {
    ZigBeeClient: jest.fn().mockImplementation(() => {
      return {
        start: () => jest.fn(),
        stop: () => jest.fn(),
        on: () => jest.fn(),
        permitJoin: () => jest.fn(),
        toggleLed: () => jest.fn(),
        getCoordinator: () => {
          return { ieeeAddr: 'coordinator', getEndpoint: jest.fn() };
        },
        getAllPairedDevices: () => {
          return Device.all();
        },
        unpairDevice: () => jest.fn(),
        resolveEntity: device => {
          return {
            type: 'device',
            device,
            endpoint: device.endpoints[0],
            name: device.type === 'Coordinator' ? 'Coordinator' : device.ieeeAddr,
            definition: findByDevice(device),
            settings: { friendlyName: device.ieeeAddr },
          };
        },
      };
    }),
  };
});

const API = new HomebridgeAPI();

const config: ZigBeeNTPlatformConfig = {
  name: 'TEST',
  platform: 'TEST',
  disableHttpServer: true,
};
const db: Database = Database.open(`${__dirname}/test.db`);
Device.injectDatabase(db);

describe('ZigBee NT Platform', () => {
  it('should start the client even if some device is not supported', async () => {
    const platform = new ZigbeeNTHomebridgePlatform(log, config, API);
    await platform.startZigBee();
    await platform.handleZigBeeReady();
    expect(platform.getAccessoryByIeeeAddr('0x00158d00047b5957')).not.toBeNull();
    expect(platform.getAccessoryByIeeeAddr('0x14b457fffec8d738')).not.toBeNull();
    expect(platform.getAccessoryByIeeeAddr('0x00124b001f79d7f0')).not.toBeNull();
    expect(platform.getAccessoryByIeeeAddr('0x0017880106ef252d')).not.toBeNull();
    expect(platform.getAccessoryByIeeeAddr('0x0017880108206ff6')).not.toBeNull();
    expect(platform.getAccessoryByIeeeAddr('0x00158d01028e2d8d')).toBeUndefined();
    await platform.stopZigbee();
  });
});
