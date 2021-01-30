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
import { Logging, LogLevel } from 'homebridge/lib/logger';
import { ZigBeeNTPlatformConfig } from '../types';
import { ConfigurableAccessory } from '../accessories/configurable-accessory';
import { PlatformAccessory } from 'homebridge';

jest.mock('../zigbee/zig-bee-client');

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
const db: Database = Database.open(`${__dirname}/test.db`);
Device.injectDatabase(db);

function getAccessoryInstance(ieeeAddr: string) {
  const device = Device.byIeeeAddr(ieeeAddr);
  return createAccessoryInstance(
    device.manufacturerName,
    device.modelID,
    new ZigbeeNTHomebridgePlatform(log, config, API),
    new API.platformAccessory('test', API.hap.uuid.generate('test')),
    new ZigBeeClient(log),
    device
  );
}

describe('Device Registry', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    // @ts-ignore
    ZigBeeClient.mockClear();
    clearRegistries();
  });

  it('should recognize Xiaomi temperature sensor', async () => {
    registerAccessoryClass('LUMI', ['lumi.weather', 'lumi.sensor_ht.agl02'], XiaomiTempHumiSensor);
    const ctor = getAccessoryInstance('0x00158d00047b5957');
    expect(ctor).toBeInstanceOf(XiaomiTempHumiSensor);
  });

  it('should recognize IKEA ON/OFF switch', () => {
    registerAccessoryClass('IKEA of Sweden', ['E1743'], IkeaOnoffSwitch);
    const ctor = getAccessoryInstance('0x14b457fffec8d738');
    expect(ctor).toBeInstanceOf(IkeaOnoffSwitch);
  });

  it('should recognize GLEDOPTO GL-C-009 bulb', () => {
    registerAccessoryClass('GLEDOPTO', ['GL-C-009'], GledoptoDim);
    const ctor = getAccessoryInstance('0x00124b001f79d7f0');
    expect(ctor).toBeInstanceOf(GledoptoDim);
  });

  it('should recognize Philips LCT015 bulb', () => {
    registerAccessoryClass('Philips', ['LCT015'], PhilipsHueWhiteAndColor);
    const ctor = getAccessoryInstance('0x0017880106ef252d');
    expect(ctor).toBeInstanceOf(PhilipsHueWhiteAndColor);
  });

  it('should recognize Philips LWA001 bulb', () => {
    registerAccessoryClass('Philips', ['LWA001'], PhilipsHueWhiteTemperature);
    const ctor = getAccessoryInstance('0x0017880108206ff6');
    expect(ctor).toBeInstanceOf(PhilipsHueWhiteTemperature);
  });

  it('should fail to recognize misconfigured device', () => {
    registerAccessoryClass('Philipsss', ['LWA001'], PhilipsHueWhiteTemperature);
    const ctor = getAccessoryInstance('0x0017880108206ff6');
    expect(ctor).toBeNull();
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
});
