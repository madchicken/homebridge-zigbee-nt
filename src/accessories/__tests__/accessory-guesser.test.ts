import Device from 'zigbee-herdsman/dist/controller/model/device';
import Database from 'zigbee-herdsman/dist/controller/database';
import { HomebridgeAPI } from 'homebridge/lib/api';
import { createAccessoryInstance } from '../../registry';
import { getDevice } from '../../utils/tests/device-builder';
import { guessAccessoryFromDevice } from '../accessory-guesser';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { ZigBeeNTPlatformConfig } from '../../types';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { ConfigurableAccessory } from '../configurable-accessory';
import { ZigBeeAccessoryFactory } from '../zig-bee-accessory';
import * as fs from 'fs';
import { log } from '../../utils/tests/null-logger';

const API = new HomebridgeAPI();

const config: ZigBeeNTPlatformConfig = {
  name: 'TEST',
  platform: 'TEST',
};

const zigBeeClient = new ZigBeeClient(log);
const zigbeeNTHomebridgePlatform = new ZigbeeNTHomebridgePlatform(log, config, API);
const dbPath = `${__dirname}/test.db`;

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
    const device = getDevice('motionSensor');
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
    const device = getDevice('light');
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
    const device = getDevice('ikeaLight');
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
    const device = getDevice('lock');
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
    const device = getDevice('contactSensor');
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
    for (const DEV of ['vibrationSensor', 'vibrationSensor2']) {
      // @ts-ignore
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
    const device = getDevice('ikeaOnOffButton');
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
