import Device from 'zigbee-herdsman/dist/controller/model/device';
import Database from 'zigbee-herdsman/dist/controller/database';
import { HomebridgeAPI } from 'homebridge/lib/api';
import { Logging, LogLevel } from 'homebridge/lib/logger';
import { createAccessoryInstance } from '../../registry';
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
      deviceIeeeAddress: '0x0000000000000001',
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
      deviceIeeeAddress: '0x0000000000000002',
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

const MOTION_SENSOR = {
  ID: 8,
  type: 'EndDevice',
  ieeeAddr: '0x0000000000000003',
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
      deviceIeeeAddress: '0x0000000000000004',
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
  ieeeAddr: '0x0000000000000005',
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
      deviceIeeeAddress: '0x0000000000000006',
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

const CONTACT_SENSOR = {
  ID: 8,
  type: 'EndDevice',
  ieeeAddr: '0x0000000000000007',
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
      deviceIeeeAddress: '0x0000000000000008',
      clusters: [],
      binds: [],
      configuredReportings: [],
      meta: {},
    },
  ],
  manufacturerName: 'Xiaomi',
  powerSource: 'Battery',
  modelID: 'lumi.sensor_magnet.aq2',
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

const VIBRATION_SENSOR = {
  ID: 8,
  type: 'EndDevice',
  ieeeAddr: '0x0000000000000009',
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
      deviceIeeeAddress: '0x0000000000000010',
      clusters: [],
      binds: [],
      configuredReportings: [],
      meta: {},
    },
  ],
  manufacturerName: 'Xiaomi',
  powerSource: 'Battery',
  modelID: 'lumi.vibration.aq1',
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

const VIBRATION_SENSOR_2 = {
  ID: 8,
  type: 'EndDevice',
  ieeeAddr: '0x0000000000000011',
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
      deviceIeeeAddress: '0x0000000000000011',
      clusters: [],
      binds: [],
      configuredReportings: [],
      meta: {},
    },
  ],
  manufacturerName: '_TYZB01_3zv6oleo',
  powerSource: 'Battery',
  modelID: 'TS0210',
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

const IKEA_LIGHT = {
  ID: 7,
  type: 'Router',
  ieeeAddr: '0x0000000000000012',
  networkAddress: 30884,
  manufacturerID: 4476,
  endpoints: [
    {
      ID: 1,
      profileID: 260,
      deviceID: 257,
      inputClusters: [0, 3, 4, 5, 6, 8, 4096],
      outputClusters: [5, 25, 32, 4096],
      deviceNetworkAddress: 30884,
      deviceIeeeAddress: '0x0000000000000012',
      clusters: { genBasic: [] },
      binds: [],
      configuredReportings: [],
      meta: {},
    },
  ],
  manufacturerName: 'IKEA of Sweden',
  powerSource: 'Mains (single phase)',
  modelID: 'TRADFRI bulb GU10 WW 400lm',
  applicationVersion: 33,
  stackVersion: 99,
  zclVersion: 3,
  hardwareVersion: 2,
  dateCode: '20181203',
  softwareBuildID: '2.1.022',
  interviewCompleted: true,
  interviewing: false,
  skipDefaultResponse: false,
  meta: {},
  lastSeen: 1613115188438,
  linkquality: 26,
};

const IKEA_ONOFF = {
  type: 'EndDevice',
  ieeeAddr: '0xccccccfffee404b7',
  networkAddress: 35876,
  manufacturerID: 4476,
  manufacturerName: 'IKEA of Sweden',
  powerSource: 'Battery',
  modelID: 'TRADFRI on/off switch',
  interviewCompleted: true,
  softwareBuildID: '2.2.008',
  lastSeen: 1614204061701,
  endpoints: [
    {
      ID: 1,
      profileID: 260,
      deviceID: 2080,
      inputClusters: [0, 1, 3, 9, 32, 4096, 64636],
      outputClusters: [3, 4, 6, 8, 25, 258, 4096],
      deviceNetworkAddress: 35876,
      deviceIeeeAddress: '0xccccccfffee404b7',
      clusters: {
        genPowerCfg: {
          attributes: {
            batteryPercentageRemaining: 34,
          },
        },
      },
      binds: [
        {
          cluster: 6,
          groupID: 901,
          type: 'group',
        },
        {
          cluster: 1,
          type: 'endpoint',
          deviceIeeeAddress: '0x00124b001cd478c0',
          endpointID: 1,
        },
      ],
      configuredReportings: [
        {
          cluster: 1,
          attrId: 33,
          minRepIntval: 3600,
          maxRepIntval: 62000,
          repChange: 0,
        },
      ],
      meta: {},
    },
  ],
  otaAvailable: true,
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

function getDevice(STRUCT): Device {
  return Device.create(
    STRUCT.type as DeviceType,
    STRUCT.ieeeAddr,
    STRUCT.networkAddress,
    STRUCT.manufacturerID,
    STRUCT.manufacturerName,
    STRUCT.powerSource,
    STRUCT.modelID,
    STRUCT.interviewCompleted,
    STRUCT.endpoints
  );
}

describe('Device Guesser', () => {
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

  it('should recognize LUMI motion sensor given the device descriptor', () => {
    const device = getDevice(MOTION_SENSOR);
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
    const device = getDevice(LIGHT);
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

  it('should recognize IKEA light bulb given the device descriptor', () => {
    const device = getDevice(IKEA_LIGHT);
    const accessory = createAccessoryInstance(
      new ZigbeeNTHomebridgePlatform(log, config, API),
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      new ZigBeeClient(log),
      device
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(1);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.Lightbulb.UUID);
  });

  it('should recognize Yale YRD426NRSC lock given the device descriptor', () => {
    const device = getDevice(LOCK);
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

  it('should recognize Xiaomi contact sensor given the device descriptor', () => {
    const device = getDevice(CONTACT_SENSOR);
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
    expect(availableServices.length).toBe(3);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.ContactSensor.UUID);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.BatteryService.UUID);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.TemperatureSensor.UUID);
  });

  it('should recognize vibration sensors given the device descriptor', () => {
    for (const DEV of [VIBRATION_SENSOR, VIBRATION_SENSOR_2]) {
      const device = getDevice(DEV);
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
      expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.ContactSensor.UUID);
      expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.BatteryService.UUID);
    }
  });

  it('should recognize IKEA On/OFF button given the device descriptor', () => {
    const device = getDevice(IKEA_ONOFF);
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
    expect(availableServices.length).toBe(1); //should be 2
  });
});
