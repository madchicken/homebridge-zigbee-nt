import Device from 'zigbee-herdsman/dist/controller/model/device';
import Database from 'zigbee-herdsman/dist/controller/database';
import { HomebridgeAPI } from 'homebridge/lib/api';
import { Logging, LogLevel } from 'homebridge/lib/logger';
import { guessAccessoryFromDevice } from '../accessory-guesser';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { DeviceType } from 'zigbee-herdsman/dist/adapter/tstype';
import { ZigBeeNTPlatformConfig } from '../../types';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { ConfigurableAccessory } from '../configurable-accessory';
import { ZigBeeAccessoryFactory } from '../zig-bee-accessory';
import * as fs from 'fs';

const LIGHT = {
  ID: 7,
  type: 'Router',
  ieeeAddr: '0x0000000000000000',
  networkAddress: 33948,
  manufacturerID: 4107,
  endpoints: [
    {
      ID: 11,
      profileID: 49246,
      deviceID: 528,
      inputClusters: [],
      outputClusters: [],
      deviceNetworkAddress: 33948,
      deviceIeeeAddress: '0x0000000000000000',
      clusters: [],
      binds: [],
      configuredReportings: [],
      meta: {},
    },
    {
      ID: 242,
      profileID: 41440,
      deviceID: 97,
      inputClusters: [],
      outputClusters: [],
      deviceNetworkAddress: 33948,
      deviceIeeeAddress: '0x0000000000000000',
      clusters: {},
      binds: [],
      configuredReportings: [],
      meta: {},
    },
  ],
  manufacturerName: 'Philips',
  powerSource: 'Mains (single phase)',
  modelID: 'LCT015',
  applicationVersion: 2,
  stackVersion: 1,
  zclVersion: 1,
  hardwareVersion: 2,
  dateCode: '20170908',
  softwareBuildID: '1.29.0_r21169',
  interviewCompleted: true,
  interviewing: false,
  meta: {},
  lastSeen: 1612474748836,
};

const SENSOR = {
  ID: 8,
  type: 'EndDevice',
  ieeeAddr: '0x0000000000000000',
  networkAddress: 59864,
  manufacturerID: 4151,
  endpoints: [
    {
      ID: 1,
      profileID: 260,
      deviceID: 263,
      inputClusters: [],
      outputClusters: [],
      deviceNetworkAddress: 59864,
      deviceIeeeAddress: '0x0000000000000000',
      clusters: [],
      binds: [],
      configuredReportings: [],
      meta: {},
    },
  ],
  manufacturerName: 'LUMI',
  powerSource: 'Battery',
  modelID: 'lumi.sensor_motion.aq2',
  applicationVersion: 5,
  stackVersion: 2,
  zclVersion: 1,
  hardwareVersion: 1,
  dateCode: '20170627',
  softwareBuildID: '3000-0001',
  interviewCompleted: true,
  interviewing: false,
  meta: {},
  lastSeen: 1612619445909,
};

const LOCK = {
  ID: 8,
  type: 'EndDevice',
  ieeeAddr: '0x0000000000000000',
  networkAddress: 59864,
  manufacturerID: 4151,
  endpoints: [
    {
      ID: 1,
      profileID: 260,
      deviceID: 263,
      inputClusters: [],
      outputClusters: [],
      deviceNetworkAddress: 59864,
      deviceIeeeAddress: '0x0000000000000000',
      clusters: [],
      binds: [],
      configuredReportings: [],
      meta: {},
    },
  ],
  manufacturerName: 'Yale',
  powerSource: 'Battery',
  modelID: 'YRD446 BLE TSDB',
  applicationVersion: 5,
  stackVersion: 2,
  zclVersion: 1,
  hardwareVersion: 1,
  dateCode: '20170627',
  softwareBuildID: '3000-0001',
  interviewCompleted: true,
  interviewing: false,
  meta: {},
  lastSeen: 1612619445909,
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
const dbPath: string = `${__dirname}/test.db`;

describe('Device Guesser', () => {
  beforeEach(() => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    const db: Database = Database.open(dbPath);
    Device.injectDatabase(db);
  });

  afterEach(() => {
    fs.unlinkSync(dbPath);
  });

  it('should recognize LUMI motion sensor given the device descriptor', () => {
    const device = Device.create(
      SENSOR.type as DeviceType,
      SENSOR.ieeeAddr,
      SENSOR.networkAddress,
      SENSOR.manufacturerID,
      SENSOR.manufacturerName,
      SENSOR.powerSource,
      SENSOR.modelID,
      SENSOR.interviewCompleted,
      SENSOR.endpoints
    );
    const factory: ZigBeeAccessoryFactory = guessAccessoryFromDevice(device);
    expect(factory).not.toBeNull();
    const accessory = factory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(4);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.BatteryService.UUID);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.MotionSensor.UUID);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.LightSensor.UUID);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.TemperatureSensor.UUID);
  });

  it('should recognize Philips light bulb given the device descriptor', () => {
    const device = Device.create(
      LIGHT.type as DeviceType,
      LIGHT.ieeeAddr,
      LIGHT.networkAddress,
      LIGHT.manufacturerID,
      LIGHT.manufacturerName,
      LIGHT.powerSource,
      LIGHT.modelID,
      LIGHT.interviewCompleted,
      LIGHT.endpoints
    );
    const factory: ZigBeeAccessoryFactory = guessAccessoryFromDevice(device);
    expect(factory).not.toBeNull();
    const accessory = factory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(1);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.Lightbulb.UUID);
  });

  it('should recognize Yale YRD426NRSC lock given the device descriptor', () => {
    const device = Device.create(
      LOCK.type as DeviceType,
      LOCK.ieeeAddr,
      LOCK.networkAddress,
      LOCK.manufacturerID,
      LOCK.manufacturerName,
      LOCK.powerSource,
      LOCK.modelID,
      LOCK.interviewCompleted,
      LOCK.endpoints
    );
    const factory: ZigBeeAccessoryFactory = guessAccessoryFromDevice(device);
    expect(factory).not.toBeNull();
    const accessory = factory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(2);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.LockMechanism.UUID);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.BatteryService.UUID);
  });
});
