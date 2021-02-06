import { Device } from 'zigbee-herdsman/dist/controller/model';
import { DeviceType } from 'zigbee-herdsman/dist/adapter/tstype';
import { TuyaThermostatControl } from '../tuya/tuya-thermostat-control';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { HomebridgeAPI } from 'homebridge/lib/api';
import { Logging, LogLevel } from 'homebridge/lib/logger';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import Database from 'zigbee-herdsman/dist/controller/database';
import * as fs from 'fs';
import { ZigBeeNTPlatformConfig } from '../../types';

const DEVICE = {
  ID: 7,
  type: 'EndDevice',
  ieeeAddr: '0x5c0272fffedb0f19',
  networkAddress: 46763,
  manufacturerID: 4098,
  endpoints: [
    {
      ID: 1,
      profileID: 260,
      deviceID: 81,
      inputClusters: [],
      outputClusters: [],
      deviceNetworkAddress: 46763,
      deviceIeeeAddress: '0x5c0272fffedb0f19',
      clusters: [],
      binds: [],
      configuredReportings: [],
      meta: {},
    },
  ],
  manufacturerName: '_TZE200_ckud7u2l',
  powerSource: 'Battery',
  modelID: 'TS0601',
  applicationVersion: 83,
  stackVersion: 0,
  zclVersion: 3,
  hardwareVersion: 1,
  dateCode: '',
  softwareBuildID: undefined,
  interviewCompleted: true,
  interviewing: false,
  meta: {},
  lastSeen: 1612546953161,
};

const API = new HomebridgeAPI();
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

const config: ZigBeeNTPlatformConfig = {
  name: 'TEST',
  platform: 'TEST',
};

const zigBeeClient = new ZigBeeClient(log);
const zigbeeNTHomebridgePlatform = new ZigbeeNTHomebridgePlatform(log, config, API);

describe('ZigBee Homekit Accessory', () => {
  beforeEach(() => {
    const db: Database = Database.open(`${__dirname}/test.db`);
    Device.injectDatabase(db);
  });

  afterEach(() => {
    return fs.unlinkSync(`${__dirname}/test.db`);
  });

  it('should always resolve the device entity for TuyaThermostatControl', () => {
    const device = Device.create(
      DEVICE.type as DeviceType,
      DEVICE.ieeeAddr,
      DEVICE.networkAddress,
      DEVICE.manufacturerID,
      DEVICE.manufacturerName,
      DEVICE.powerSource,
      DEVICE.modelID,
      DEVICE.interviewCompleted,
      DEVICE.endpoints
    );

    const accessory = new TuyaThermostatControl(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device
    );
    expect(accessory.zigBeeDefinition).toBeDefined();
  });
});
