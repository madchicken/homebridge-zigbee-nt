import { registerSupportedDevices } from '../devices-registration';
import {
  clearRegistries,
  createAccessoryInstance,
  registerAccessoryClass,
  registerAccessoryFactory,
} from '../registry';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import { XiaomiTempHumiSensor } from '../accessories/xiaomi/xiaomi-temp-humi-sensor';
import Database from 'zigbee-herdsman/dist/controller/database';
import { IkeaOnoffSwitch } from '../accessories/ikea/ikea-onoff-switch';
import { GledoptoDim } from '../accessories/gledopto/gledopto-dim';
import { PhilipsHueWhiteAndColor } from '../accessories/philips/philips-hue-white-and-color';
import { PhilipsHueWhiteTemperature } from '../accessories/philips/philips-hue-white-temperature';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { HomebridgeAPI } from 'homebridge/lib/api';
import { log } from '../utils/tests/null-logger';
import { ZigBeeNTPlatformConfig } from '../types';
import { ConfigurableAccessory } from '../accessories/configurable-accessory';
import { PlatformAccessory } from 'homebridge';
import { PhilipsHueWhite } from '../accessories/philips/philips-hue-white';
import { IkeaSignalRepeater } from '../accessories/ikea/ikea-signal-repeater';
import { IkeaTradfriDimColor } from '../accessories/ikea/ikea-tradfri-dim-color';

const API = new HomebridgeAPI();

const config: ZigBeeNTPlatformConfig = {
  name: 'TEST',
  platform: 'TEST',
};
const dbPath = `${__dirname}/test.db`;
const db: Database = Database.open(dbPath);
Device.injectDatabase(db);
const zigBeeClient = new ZigBeeClient(log);
zigBeeClient.init({ port: 'foo', 'channel': 11, database: dbPath, adapter: 'zstack', panId: 1 });

function getAccessoryInstance(ieeeAddr: string) {
  const device = Device.byIeeeAddr(ieeeAddr);
  return createAccessoryInstance(
    new ZigbeeNTHomebridgePlatform(log, config, API),
    new API.platformAccessory('test', API.hap.uuid.generate('test')),
    zigBeeClient,
    device
  );
}

describe('Device Registry', () => {
  beforeEach(() => {
    clearRegistries();
  });

  it('should recognize Xiaomi temperature sensor', async () => {
    registerSupportedDevices();
    const ctor = getAccessoryInstance('0x00158d00047b5957');
    expect(ctor).toBeInstanceOf(XiaomiTempHumiSensor);
  });

  it('should recognize IKEA ON/OFF switch', () => {
    registerSupportedDevices();
    const ctor = getAccessoryInstance('0x14b457fffec8d738');
    expect(ctor).toBeInstanceOf(IkeaOnoffSwitch);
  });

  it('should recognize GLEDOPTO GL-C-009 bulb', () => {
    registerSupportedDevices();
    const ctor = getAccessoryInstance('0x00124b001f79d7f0');
    expect(ctor).toBeInstanceOf(GledoptoDim);
  });

  it('should recognize Philips LCT015 bulb', () => {
    registerSupportedDevices();
    const ctor = getAccessoryInstance('0x0017880106ef252d');
    expect(ctor).toBeInstanceOf(PhilipsHueWhiteAndColor);
  });

  it('should recognize Philips LWA001 bulb', () => {
    registerSupportedDevices();
    const ctor = getAccessoryInstance('0x0017880108206ff6');
    expect(ctor).toBeInstanceOf(PhilipsHueWhite);
  });

  it('should recognize TRADFRI bulb E27 CWS opal 600lm', () => {
    registerSupportedDevices();
    const ctor = getAccessoryInstance('0x14b457fffe4f77ca');
    expect(ctor).toBeInstanceOf(IkeaTradfriDimColor);
  });

  it('should recognize Philips LWA001 bulb registered as configurable device', () => {
    registerAccessoryFactory(
      'Philips',
      ['LWA001'],
      (
        platform: ZigbeeNTHomebridgePlatform,
        accessory: PlatformAccessory,
        client: ZigBeeClient,
        data: Device
      ) =>
        new ConfigurableAccessory(platform, accessory, client, data, [
          {
            type: 'bulb',
            meta: {
              colorTemp: true,
              brightness: true,
            },
          },
        ])
    );
    const ctor = getAccessoryInstance('0x0017880108206ff6');
    expect(ctor).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = ctor.getAvailableServices();
    expect(availableServices.length).toBe(1);
    expect(availableServices[0].UUID).toBe(API.hap.Service.Lightbulb.UUID);
  });

  it('should give precedence to device configured manually', () => {
    registerAccessoryClass('Philips', ['LWA001'], PhilipsHueWhiteTemperature);
    registerAccessoryFactory(
      'Philips',
      ['LWA001'],
      (
        platform: ZigbeeNTHomebridgePlatform,
        accessory: PlatformAccessory,
        client: ZigBeeClient,
        data: Device
      ) =>
        new ConfigurableAccessory(platform, accessory, client, data, [
          {
            type: 'bulb',
          },
        ])
    );
    const ctor = getAccessoryInstance('0x0017880108206ff6');
    expect(ctor).toBeInstanceOf(ConfigurableAccessory);
    const availableServices = ctor.getAvailableServices();
    expect(availableServices.length).toBe(1);
    expect(availableServices[0].UUID).toBe(API.hap.Service.Lightbulb.UUID);
  });

  it('should not crash when a device is not supported', () => {
    const device = Device.byIeeeAddr('0x00158d01028e2d8d');
    const ctor = createAccessoryInstance(
      new ZigbeeNTHomebridgePlatform(log, config, API),
      new API.platformAccessory('test', API.hap.uuid.generate('test')),
      new ZigBeeClient(log),
      device
    );
    expect(ctor).toBeNull();
  });

  it('should recognize Ikea Signal Repeater', function () {
    registerSupportedDevices();
    const ctor = getAccessoryInstance('0x84fd27fffe6fab53');
    expect(ctor).toBeInstanceOf(IkeaSignalRepeater);
  });

  it('should recognize SONOFF ZBMINI-L', function () {
    registerSupportedDevices();
    const ctor = getAccessoryInstance('0x00124b0026b753c7');
    expect(ctor).toBeInstanceOf(ConfigurableAccessory);
  });

});
