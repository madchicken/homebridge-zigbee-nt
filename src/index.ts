import { API } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_IDENTIFIER } from './settings';
import { ZigbeeNTHomebridgePlatform } from './platform';
import { registerAccessoryClass, registerAccessoryFactory } from './registry';
import { IkeaTradfriOutlet } from './accessories/ikea/ikea-tradfri-outlet';
import { IkeaOnoffSwitch } from './accessories/ikea/ikea-onoff-switch';
import { XiaomiTempHumiSensor } from './accessories/xiaomi/xiaomi-temp-humi-sensor';
import { TuyaOnoffDoubleSwitch } from './accessories/tuya/tuya-onoff-double-switch';
import { XiaomiContactSensor } from './accessories/xiaomi/xiaomi-contact-sensor';
import { XiaomiLightIntensitySensor } from './accessories/xiaomi/xiaomi-light-intensity-sensor';
import { XiaomiOutlet } from './accessories/xiaomi/xiaomi-outlet';
import { IkeaRemoteSwitch } from './accessories/ikea/ikea-remote-switch';
import { NamronDimmer } from './accessories/namron/namron-dimmer';
import { NamronSwitch } from './accessories/namron/namron-switch';
import { XiaomiVibrationSensor } from './accessories/xiaomi/xiaomi-vibration-sensor';
import { LonsonhoDoubleSwitch } from './accessories/lonsonho/lonsonho-double-switch';
import { XiaomiWirelessSwitch } from './accessories/xiaomi/xiaomi-wireless-switch';
import { IkeaShurtcutSwitch } from './accessories/ikea/ikea-shurtcut-switch';
import { TuyaThermostatControl } from './accessories/tuya/tuya-thermostat-control';
import {
  AqaraOppleSwitch2Buttons,
  AqaraOppleSwitch4Buttons,
  AqaraOppleSwitch6Buttons,
} from './accessories/xiaomi/aqara-opple-switch';
import { DATABASE_ACCESSORIES } from './accessories/database';
import { ConfigurableAccessory } from './accessories/configurable-accessory';

function registerSupportedDevices(): void {
  registerAccessoryClass('IKEA of Sweden', ['E1603/E1702'], IkeaTradfriOutlet);
  registerAccessoryClass('IKEA of Sweden', ['E1743'], IkeaOnoffSwitch);
  registerAccessoryClass('IKEA of Sweden', ['E1812'], IkeaShurtcutSwitch);
  registerAccessoryClass('IKEA of Sweden', ['E1524/E1810'], IkeaRemoteSwitch);

  registerAccessoryClass(
    'Xiaomi',
    [
      'ZNCZ02LM' /*ZH*/,
      'ZNCZ03LM' /*TW*/,
      'ZNCZ04LM' /*EU*/,
      'SP-EUC01' /*EU-Aqara*/,
      'ZNCZ12LM' /*US*/,
    ],
    XiaomiOutlet
  );
  registerAccessoryClass(
    'LUMI',
    [
      'ZNCZ02LM' /*ZH*/,
      'ZNCZ03LM' /*TW*/,
      'ZNCZ04LM' /*EU*/,
      'SP-EUC01' /*EU-Aqara*/,
      'ZNCZ12LM' /*US*/,
    ],
    XiaomiOutlet
  );

  registerAccessoryClass('LUMI', ['DJT11LM', 'DJT12LM'], XiaomiVibrationSensor);

  registerAccessoryClass('Xiaomi', ['WSDCGQ01LM', 'WSDCGQ11LM'], XiaomiTempHumiSensor);
  registerAccessoryClass(
    'Xiaomi',
    ['lumi.sensor_magnet', 'lumi.sensor_magnet.aq2'],
    XiaomiContactSensor
  );
  registerAccessoryClass('Xiaomi', ['GZCGQ01LM'], XiaomiLightIntensitySensor);
  registerAccessoryClass('Xiaomi', ['WXKG11LM', 'WXKG03LM', 'WXKG12LM'], XiaomiWirelessSwitch);
  registerAccessoryClass('Xiaomi', ['WXCJKG11LM'], AqaraOppleSwitch2Buttons);
  registerAccessoryClass('Xiaomi', ['WXCJKG12LM'], AqaraOppleSwitch4Buttons);
  registerAccessoryClass('Xiaomi', ['WXCJKG13LM'], AqaraOppleSwitch6Buttons);
  registerAccessoryClass(
    'LUMI',
    [
      'lumi.sensor_switch.aq2',
      'lumi.sensor_switch',
      'lumi.remote.b1acn01',
      'lumi.sensor_86sw1',
      'lumi.remote.b186acn01',
    ],
    XiaomiWirelessSwitch
  );
  registerAccessoryClass('LUMI', ['lumi.remote.b286opcn01'], AqaraOppleSwitch2Buttons);
  registerAccessoryClass('LUMI', ['lumi.remote.b486opcn01'], AqaraOppleSwitch4Buttons);
  registerAccessoryClass('LUMI', ['lumi.remote.b686opcn01'], AqaraOppleSwitch6Buttons);
  registerAccessoryClass('TuYa', ['GDKES-02TZXD'], TuyaOnoffDoubleSwitch);
  registerAccessoryClass('TuYa', ['TS0012'], LonsonhoDoubleSwitch);
  registerAccessoryClass('NAMRON AS', ['4512700', '1402755'], NamronDimmer);
  registerAccessoryClass('NAMRON AS', ['4512704'], NamronSwitch);
  registerAccessoryClass('TuYa', ['TS0601_thermostat'], TuyaThermostatControl);
  registerAccessoryClass('Moes', ['HY369RT'], TuyaThermostatControl);
  registerAccessoryClass(
    ['_TZE200_ckud7u2l', '_TZE200_2dpplnsn'],
    ['TS0601'],
    TuyaThermostatControl
  );

  // Register devices defined in local database
  DATABASE_ACCESSORIES.forEach(deviceConfig =>
    registerAccessoryFactory(
      deviceConfig.manufacturer,
      deviceConfig.models,
      (platform, accessory, client, device) =>
        new ConfigurableAccessory(platform, accessory, client, device, deviceConfig.services)
    )
  );
}

/**
 * This method registers the platform with Homebridge
 */
export default function(api: API): void {
  registerSupportedDevices();
  api.registerPlatform(PLUGIN_IDENTIFIER, PLATFORM_NAME, ZigbeeNTHomebridgePlatform);
}
