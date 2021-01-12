import { getAccessoryClass, registerAccessoryClass } from '../registry';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import { XiaomiTempHumiSensor } from '../accessories/xiaomi/xiaomi-temp-humi-sensor';
import Database from 'zigbee-herdsman/dist/controller/database';
import { IkeaOnoffSwitch } from '../accessories/ikea/ikea-onoff-switch';
import { GledoptoDim } from '../accessories/gledopto/gledopto-dim';

describe('Device Registry', () => {
  it('should recognize Xiaomi temperature sensor', async () => {
    registerAccessoryClass('LUMI', ['lumi.weather', 'lumi.sensor_ht.agl02'], XiaomiTempHumiSensor);
    const db: Database = Database.open(`${__dirname}/test.db`);
    Device.injectDatabase(db);
    const device: Device = Device.byIeeeAddr('0x00158d00047b5957');
    const ctor = getAccessoryClass(device.manufacturerName, device.modelID);
    expect(ctor).toBe(XiaomiTempHumiSensor);
  });

  it('should recognize IKEA ON/OFF switch', () => {
    registerAccessoryClass('IKEA of Sweden', ['E1743'], IkeaOnoffSwitch);
    const db: Database = Database.open(`${__dirname}/test.db`);
    Device.injectDatabase(db);
    const device: Device = Device.byIeeeAddr('0x14b457fffec8d738');
    const ctor = getAccessoryClass(device.manufacturerName, device.modelID);
    expect(ctor).toBe(IkeaOnoffSwitch);
  });

  it('should recognize GLEDOPTO GL-C-009 bulb', () => {
    registerAccessoryClass('GLEDOPTO', ['GL-C-009'], GledoptoDim);
    const db: Database = Database.open(`${__dirname}/test.db`);
    Device.injectDatabase(db);
    const device: Device = Device.byIeeeAddr('0x00124b001f79d7f0');
    const ctor = getAccessoryClass(device.manufacturerName, device.modelID);
    expect(ctor).toBe(GledoptoDim);
  });
});
