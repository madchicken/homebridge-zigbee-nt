"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSupportedDevices = void 0;
const configurable_accessory_1 = require("./accessories/configurable-accessory");
const database_1 = require("./accessories/database");
const gledopto_dim_1 = require("./accessories/gledopto/gledopto-dim");
const ikea_motion_sensor_1 = require("./accessories/ikea/ikea-motion-sensor");
const ikea_onoff_switch_1 = require("./accessories/ikea/ikea-onoff-switch");
const ikea_remote_switch_1 = require("./accessories/ikea/ikea-remote-switch");
const ikea_shurtcut_switch_1 = require("./accessories/ikea/ikea-shurtcut-switch");
const ikea_tradfri_dim_1 = require("./accessories/ikea/ikea-tradfri-dim");
const ikea_tradfri_dim_color_1 = require("./accessories/ikea/ikea-tradfri-dim-color");
const ikea_tradfri_dim_colortemp_1 = require("./accessories/ikea/ikea-tradfri-dim-colortemp");
const ikea_tradfri_outlet_1 = require("./accessories/ikea/ikea-tradfri-outlet");
const innr_white_temperature_1 = require("./accessories/innr/innr-white-temperature");
const linkind_motion_sensor_1 = require("./accessories/linkind/linkind-motion-sensor");
const lonsonho_double_switch_1 = require("./accessories/lonsonho/lonsonho-double-switch");
const namron_dimmer_1 = require("./accessories/namron/namron-dimmer");
const namron_switch_1 = require("./accessories/namron/namron-switch");
const nanoleaf_ivy_1 = require("./accessories/nanoleaf/nanoleaf-ivy");
const philips_hue_white_1 = require("./accessories/philips/philips-hue-white");
const philips_hue_white_and_color_1 = require("./accessories/philips/philips-hue-white-and-color");
const philips_hue_white_temperature_1 = require("./accessories/philips/philips-hue-white-temperature");
const contact_sensor_1 = require("./accessories/sonoff/contact-sensor");
const tuya_onoff_double_switch_1 = require("./accessories/tuya/tuya-onoff-double-switch");
const tuya_thermostat_control_1 = require("./accessories/tuya/tuya-thermostat-control");
const aqara_curtain_motor_1 = require("./accessories/xiaomi/aqara-curtain-motor");
const aqara_opple_switch_1 = require("./accessories/xiaomi/aqara-opple-switch");
const xiaomi_contact_sensor_1 = require("./accessories/xiaomi/xiaomi-contact-sensor");
const xiaomi_leak_sensor_1 = require("./accessories/xiaomi/xiaomi-leak-sensor");
const xiaomi_light_intensity_sensor_1 = require("./accessories/xiaomi/xiaomi-light-intensity-sensor");
const xiaomi_motion_illuminance_sensor_1 = require("./accessories/xiaomi/xiaomi-motion-illuminance-sensor");
const xiaomi_motion_sensor_1 = require("./accessories/xiaomi/xiaomi-motion-sensor");
const xiaomi_outlet_1 = require("./accessories/xiaomi/xiaomi-outlet");
const xiaomi_temp_humi_sensor_1 = require("./accessories/xiaomi/xiaomi-temp-humi-sensor");
const xiaomi_vibration_sensor_1 = require("./accessories/xiaomi/xiaomi-vibration-sensor");
const xiaomi_wireless_switch_1 = require("./accessories/xiaomi/xiaomi-wireless-switch");
const registry_1 = require("./registry");
function registerSupportedDevices() {
    registry_1.registerAccessoryClass('GLEDOPTO', ['GL-C-009'], gledopto_dim_1.GledoptoDim);
    registry_1.registerAccessoryClass(['Philips', 'Signify Netherlands B.V.'], ['LWA001', 'LWA002', 'LWB006', 'LWB010', 'LWB014'], philips_hue_white_1.PhilipsHueWhite);
    registry_1.registerAccessoryClass(['Philips', 'Signify Netherlands B.V.'], ['LTA001'], philips_hue_white_temperature_1.PhilipsHueWhiteTemperature);
    registry_1.registerAccessoryClass(['Philips', 'Signify Netherlands B.V.'], [
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
    ], philips_hue_white_and_color_1.PhilipsHueWhiteAndColor);
    registry_1.registerAccessoryClass('IKEA of Sweden', [
        'LED1545G12',
        'LED1546G12',
        'LED1537R6/LED1739R5',
        'LED1536G5',
        'LED1903C5/LED1835C6',
        'LED1733G7',
        'LED1732G11',
        'LED1736G9',
    ], ikea_tradfri_dim_colortemp_1.IkeaTradfriDimColortemp);
    registry_1.registerAccessoryClass('IKEA of Sweden', [
        'LED1623G12',
        'LED1650R5',
        'LED1837R5',
        'LED1842G3',
        'LED1622G12',
        'LED1649C5',
        'LED1836G9',
        'ICPSHC24-10EU-IL-1',
        'ICPSHC24-30EU-IL-1',
    ], ikea_tradfri_dim_1.IkeaTradfriDim);
    registry_1.registerAccessoryClass('IKEA of Sweden', ['E1603/E1702'], ikea_tradfri_outlet_1.IkeaTradfriOutlet);
    registry_1.registerAccessoryClass('IKEA of Sweden', ['LED1624G9'], ikea_tradfri_dim_color_1.IkeaTradfriDimColor);
    registry_1.registerAccessoryClass('IKEA of Sweden', ['E1743', 'TRADFRI on/off switch'], ikea_onoff_switch_1.IkeaOnoffSwitch);
    registry_1.registerAccessoryClass('IKEA of Sweden', ['E1812', 'TRADFRI SHORTCUT Button'], ikea_shurtcut_switch_1.IkeaShurtcutSwitch);
    registry_1.registerAccessoryClass('IKEA of Sweden', ['E1524/E1810'], ikea_remote_switch_1.IkeaRemoteSwitch);
    registry_1.registerAccessoryClass('IKEA of Sweden', ['E1525/E1745', 'TRADFRI motion sensor'], ikea_motion_sensor_1.IkeaMotionSensor);
    registry_1.registerAccessoryClass('innr', ['RB 278 T'], innr_white_temperature_1.InnrWhiteTemperature);
    registry_1.registerAccessoryClass('Xiaomi', [
        'ZNCZ02LM' /*ZH*/,
        'ZNCZ03LM' /*TW*/,
        'ZNCZ04LM' /*EU*/,
        'SP-EUC01' /*EU-Aqara*/,
        'ZNCZ12LM' /*US*/,
    ], xiaomi_outlet_1.XiaomiOutlet);
    registry_1.registerAccessoryClass('LUMI', [
        'ZNCZ02LM' /*ZH*/,
        'ZNCZ03LM' /*TW*/,
        'ZNCZ04LM' /*EU*/,
        'SP-EUC01' /*EU-Aqara*/,
        'ZNCZ12LM' /*US*/,
    ], xiaomi_outlet_1.XiaomiOutlet);
    registry_1.registerAccessoryClass('LUMI', ['DJT11LM', 'DJT12LM'], xiaomi_vibration_sensor_1.XiaomiVibrationSensor);
    registry_1.registerAccessoryClass('Xiaomi', ['WSDCGQ01LM', 'WSDCGQ11LM'], xiaomi_temp_humi_sensor_1.XiaomiTempHumiSensor);
    registry_1.registerAccessoryClass('Xiaomi', ['lumi.sensor_magnet', 'lumi.sensor_magnet.aq2'], xiaomi_contact_sensor_1.XiaomiContactSensor);
    registry_1.registerAccessoryClass('Xiaomi', ['GZCGQ01LM'], xiaomi_light_intensity_sensor_1.XiaomiLightIntensitySensor);
    registry_1.registerAccessoryClass('Xiaomi', ['WXKG11LM', 'WXKG03LM', 'WXKG12LM'], xiaomi_wireless_switch_1.XiaomiWirelessSwitch);
    registry_1.registerAccessoryClass('Xiaomi', ['WXCJKG11LM'], aqara_opple_switch_1.AqaraOppleSwitch2Buttons);
    registry_1.registerAccessoryClass('Xiaomi', ['WXCJKG12LM'], aqara_opple_switch_1.AqaraOppleSwitch4Buttons);
    registry_1.registerAccessoryClass('Xiaomi', ['WXCJKG13LM'], aqara_opple_switch_1.AqaraOppleSwitch6Buttons);
    registry_1.registerAccessoryClass('LUMI', ['lumi.weather', 'lumi.sensor_ht.agl02', 'lumi.sensor_ht'], xiaomi_temp_humi_sensor_1.XiaomiTempHumiSensor);
    registry_1.registerAccessoryClass('LUMI', ['lumi.sensor_magnet', 'lumi.sensor_magnet.aq2'], xiaomi_contact_sensor_1.XiaomiContactSensor);
    registry_1.registerAccessoryClass('LUMI', ['lumi.sen_ill.mgl01'], xiaomi_light_intensity_sensor_1.XiaomiLightIntensitySensor);
    registry_1.registerAccessoryClass('LUMI', [
        'lumi.sensor_switch.aq2',
        'lumi.sensor_switch',
        'lumi.remote.b1acn01',
        'lumi.sensor_86sw1',
        'lumi.remote.b186acn01',
    ], xiaomi_wireless_switch_1.XiaomiWirelessSwitch);
    registry_1.registerAccessoryClass('LUMI', ['lumi.remote.b286opcn01'], aqara_opple_switch_1.AqaraOppleSwitch2Buttons);
    registry_1.registerAccessoryClass('LUMI', ['lumi.remote.b486opcn01'], aqara_opple_switch_1.AqaraOppleSwitch4Buttons);
    registry_1.registerAccessoryClass('LUMI', ['lumi.remote.b686opcn01'], aqara_opple_switch_1.AqaraOppleSwitch6Buttons);
    registry_1.registerAccessoryClass('LUMI', ['lumi.curtain'], aqara_curtain_motor_1.AqaraCurtainMotor);
    registry_1.registerAccessoryClass('LUMI', ['lumi.sensor_motion'], xiaomi_motion_sensor_1.XiaomiMotionSensor);
    registry_1.registerAccessoryClass('Xiaomi', ['lumi.sensor_motion'], xiaomi_motion_sensor_1.XiaomiMotionSensor);
    registry_1.registerAccessoryClass('LUMI', ['lumi.sensor_motion.aq2'], xiaomi_motion_illuminance_sensor_1.XiaomiMotionIlluminanceSensor); // TODO: copy
    registry_1.registerAccessoryClass('Xiaomi', ['lumi.sensor_motion.aq2'], xiaomi_motion_illuminance_sensor_1.XiaomiMotionIlluminanceSensor);
    registry_1.registerAccessoryClass('LUMI', ['lumi.sensor_wleak.aq1'], xiaomi_leak_sensor_1.XiaomiLeakSensor);
    registry_1.registerAccessoryClass('TuYa', ['GDKES-02TZXD'], tuya_onoff_double_switch_1.TuyaOnoffDoubleSwitch);
    registry_1.registerAccessoryClass('TuYa', ['TS0012'], lonsonho_double_switch_1.LonsonhoDoubleSwitch);
    registry_1.registerAccessoryClass('lk', ['ZB-MotionSensor-D0003'], linkind_motion_sensor_1.LinkindMotionSensor);
    registry_1.registerAccessoryClass('NAMRON AS', ['4512700', '1402755'], namron_dimmer_1.NamronDimmer);
    registry_1.registerAccessoryClass('NAMRON AS', ['4512704'], namron_switch_1.NamronSwitch);
    registry_1.registerAccessoryClass('TuYa', ['TS0601_thermostat'], tuya_thermostat_control_1.TuyaThermostatControl);
    registry_1.registerAccessoryClass('Moes', ['HY369RT'], tuya_thermostat_control_1.TuyaThermostatControl);
    registry_1.registerAccessoryClass(['_TZE200_ckud7u2l', '_TZE200_ywdxldoj'], ['TS0601'], tuya_thermostat_control_1.TuyaThermostatControl);
    registry_1.registerAccessoryClass('eWeLink', ['DS01'], contact_sensor_1.SonoffContactSensor);
    registry_1.registerAccessoryClass('Nanoleaf', ['NL08-0800'], nanoleaf_ivy_1.NanoleafIvy);
    // Register devices defined in local database
    database_1.DATABASE_ACCESSORIES.forEach(deviceConfig => registry_1.registerAccessoryFactory(deviceConfig.manufacturer, deviceConfig.models, (platform, accessory, client, device) => new configurable_accessory_1.ConfigurableAccessory(platform, accessory, client, device, deviceConfig.services)));
}
exports.registerSupportedDevices = registerSupportedDevices;
//# sourceMappingURL=devices-registration.js.map