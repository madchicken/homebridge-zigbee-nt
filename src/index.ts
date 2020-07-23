import { API } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_IDENTIFIER } from './settings';
import { ZigbeeNTHomebridgePlatform } from './platform';
import { registerAccessoryClass } from './registry';
import { PhilipsHueWhite } from './accessories/philips/philips-hue-white';
import { PhilipsHueWhiteAndColor } from './accessories/philips/philips-hue-white-and-color';
import { IkeaTadfriDimColortemp } from './accessories/ikea/ikea-tadfri-dim-colortemp';
import { IkeaTadfriDim } from './accessories/ikea/ikea-tadfri-dim';
import { IkeaTadfriOutlet } from './accessories/ikea/ikea-tadfri-outlet';
import { IkeaTadfriDimColor } from './accessories/ikea/ikea-tadfri-dim-color';
import { IkeaOnoffSwitch } from './accessories/ikea/ikea-onoff-switch';
import { TempHumiSensor } from './accessories/xiaomi/temp-humi-sensor';
import { GledoptoDim } from './accessories/gledopto/gledopto-dim';
import { TuyaOnoffDoubleSwitch } from './accessories/tuya/tuya-onoff-double-switch';
import { XiaomiContactSensor } from './accessories/xiaomi/contact-sensor';
import { XiaomiLightIntensitySensor } from './accessories/xiaomi/light-intensity-sensor';
import { IkeaRemoteSwitch } from './accessories/ikea/ikea-remote-switch';

function registerSupportedDevices() {
  registerAccessoryClass('GLEDOPTO', ['GL-C-009'], GledoptoDim);
  registerAccessoryClass('Philips', ['LWA001', 'LWA002', 'LWB006', 'LWB014'], PhilipsHueWhite);
  registerAccessoryClass(
    'Philips',
    [
      'LCT001',
      'LCT007',
      'LCT010',
      'LCT012',
      'LCT014',
      'LCT015',
      'LCT016',
      'LCT021',
      'LCT002',
      'LCT011',
      'LCT003',
      'LCT024',
      'LCA001',
      'LCA002',
      'LCA003',
      'LST003',
      'LST004',
      'LST002',
    ],
    PhilipsHueWhiteAndColor
  );
  registerAccessoryClass(
    'IKEA of Sweden',
    [
      'LED1545G12',
      'LED1546G12',
      'LED1537R6/LED1739R5',
      'LED1536G5',
      'LED1903C5/LED1835C6',
      'LED1733G7',
      'LED1732G11',
      'LED1736G9',
    ],
    IkeaTadfriDimColortemp
  );
  registerAccessoryClass(
    'IKEA of Sweden',
    [
      'LED1623G12',
      'LED1650R5',
      'LED1837R5',
      'LED1842G3',
      'LED1622G12',
      'LED1649C5',
      'LED1836G9',
      'ICPSHC24-10EU-IL-1',
      'ICPSHC24-30EU-IL-1',
    ],
    IkeaTadfriDim
  );
  registerAccessoryClass('IKEA of Sweden', ['E1603/E1702'], IkeaTadfriOutlet);
  registerAccessoryClass('IKEA of Sweden', ['LED1624G9'], IkeaTadfriDimColor);
  registerAccessoryClass('IKEA of Sweden', ['E1743'], IkeaOnoffSwitch);
  registerAccessoryClass('IKEA of Sweden', ['E1524/E1810'], IkeaRemoteSwitch);
  registerAccessoryClass('Xiaomi', ['WSDCGQ01LM', 'WSDCGQ11LM'], TempHumiSensor);
  registerAccessoryClass('LUMI', ['lumi.weather', 'lumi.sensor_ht.agl02'], TempHumiSensor);
  registerAccessoryClass('Xiaomi', ['MCCGQ01LM'], XiaomiContactSensor);
  registerAccessoryClass('LUMI', ['lumi.sensor_magnet'], XiaomiContactSensor);
  registerAccessoryClass('Xiaomi', ['GZCGQ01LM'], XiaomiLightIntensitySensor);
  registerAccessoryClass('LUMI', ['lumi.sen_ill.mgl01'], XiaomiLightIntensitySensor);
  registerAccessoryClass('TuYa', ['GDKES-02TZXD'], TuyaOnoffDoubleSwitch);
}

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  registerSupportedDevices();
  api.registerPlatform(PLUGIN_IDENTIFIER, PLATFORM_NAME, ZigbeeNTHomebridgePlatform);
};
