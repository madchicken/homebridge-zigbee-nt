import * as fs from 'fs';
import { HomebridgeAPI } from 'homebridge/lib/api';
import Database from 'zigbee-herdsman/dist/controller/database';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { createAccessoryInstance } from '../../registry';
import { ZigBeeNTPlatformConfig } from '../../types';
import { getDevice } from '../../utils/tests/device-builder';
import { log } from '../../utils/tests/null-logger';
import { ZigBeeClient } from '../../zigbee/zig-bee-client';
import { guessAccessoryFromDevice } from '../accessory-guesser';
import { ConfigurableAccessory } from '../configurable-accessory';

const API = new HomebridgeAPI();

const config: ZigBeeNTPlatformConfig = {
  name: 'TEST',
  platform: 'TEST',
};

const zigBeeClient = new ZigBeeClient(log);
const zigbeeNTHomebridgePlatform = new ZigbeeNTHomebridgePlatform(log, config, API);
const dbPath = `${__dirname}/test.db`;
zigBeeClient.init({ port: 'foo', 'channel': 11, database: dbPath, adapter: 'zstack', panId: 1 });

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
    const services = guessAccessoryFromDevice(device);
    expect(services).not.toBeNull();
    const accessory = new ConfigurableAccessory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device,
      services
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(3);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.BatteryService.UUID);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.MotionSensor.UUID);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.LightSensor.UUID);
  });

  it('should recognize Philips light bulb given the device descriptor', () => {
    const device = getDevice('light');
    const services = guessAccessoryFromDevice(device);
    expect(services).not.toBeNull();
    const accessory = new ConfigurableAccessory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device,
      services
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
      zigBeeClient,
      device
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(1);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.Lightbulb.UUID);
  });

  it('should recognize Yale YRD426NRSC lock given the device descriptor', () => {
    const device = getDevice('lock');
    const services = guessAccessoryFromDevice(device);
    expect(services).not.toBeNull();
    const accessory = new ConfigurableAccessory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device,
      services
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(2);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.LockMechanism.UUID);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.BatteryService.UUID);
  });

  it('should recognize Xiaomi contact sensor given the device descriptor', () => {
    const device = getDevice('contactSensor');
    const services = guessAccessoryFromDevice(device);
    expect(services).not.toBeNull();
    const accessory = new ConfigurableAccessory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device,
      services
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(2);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.ContactSensor.UUID);
    expect(availableServices.map(s => s.UUID)).toContain(API.hap.Service.BatteryService.UUID);
  });

  it('should recognize vibration sensors given the device descriptor', () => {
    for (const DEV of ['vibrationSensor', 'vibrationSensor2']) {
      // @ts-ignore
      const device = getDevice(DEV);
      const services = guessAccessoryFromDevice(device);
      expect(services).not.toBeNull();
      const accessory = new ConfigurableAccessory(
        zigbeeNTHomebridgePlatform,
        new API.platformAccessory('test', API.hap.uuid.generate('test')),
        zigBeeClient,
        device,
        services
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
    const services = guessAccessoryFromDevice(device);
    expect(services).not.toBeNull();
    const accessory = new ConfigurableAccessory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device,
      services
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(3); // battery, button I, button O
  });

  it('should recognize Lumi remote switch', () => {
    const device = getDevice('lumiRemoteSwitch');
    const services = guessAccessoryFromDevice(device);
    expect(services).not.toBeNull();
    const accessory = new ConfigurableAccessory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device,
      services
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(4); // button left, button right, button both, battery
  });

  it('should recognize SomGos switch', () => {
    const device = getDevice('somgomsSwitch');
    const services = guessAccessoryFromDevice(device);
    expect(services).not.toBeNull();
    expect(services.length).toBe(4);
    expect(services[0].type).toBe('switch');
    expect(services[1].type).toBe('switch');
    expect(services[2].type).toBe('switch');
    expect(services[3].type).toBe('switch');
    const accessory = new ConfigurableAccessory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device,
      services
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(4); // 4 switches
  });

  it('should recognize Tuya smart dimmer', () => {
    const device = getDevice('tuyaSmartDimmer');
    const services = guessAccessoryFromDevice(device);
    expect(services).not.toBeNull();
    expect(services.length).toBe(1);
    expect(services[0].type).toBe('light-bulb');
    expect(services[0].meta.brightness).toBe(true);
    expect(services[0].meta.colorHS).not.toBeDefined();
    expect(services[0].meta.colorTemp).not.toBeDefined();
    expect(services[0].meta.colorXY).not.toBeDefined();
    const accessory = new ConfigurableAccessory(
      zigbeeNTHomebridgePlatform,
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      zigBeeClient,
      device,
      services
    );
    expect(accessory).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = accessory.getAvailableServices();
    expect(availableServices.length).toBe(1); // ligh bulb
  });
});
