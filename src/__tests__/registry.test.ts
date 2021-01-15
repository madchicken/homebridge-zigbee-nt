import { createAccessoryInstance, registerAccessoryClass } from '../registry';
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
import { withPrefix } from 'homebridge/lib/logger';
import { ZigBeeNTPlatformConfig } from '../types';

jest.mock('../zigbee/zig-bee-client');

const API = new HomebridgeAPI();
const log = withPrefix('test');
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
});
