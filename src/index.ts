import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { ZigbeeNTHomebridgePlatform } from './platform';
import {registerAccessoryClass} from "./registry";
import {PhilipsHueWhite} from "./accessories/philips-hue-white";
import { PhilipsHueWhiteAndColor } from './accessories/philips-hue-white-and-color';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  registerAccessoryClass('Philips', ['LWA001', 'LWA002', 'LWB006', 'LWB014'], PhilipsHueWhite);
  registerAccessoryClass('Philips', ['LCT001', 'LCT007', 'LCT010', 'LCT012', 'LCT014', 'LCT015', 'LCT016', 'LCT021'], PhilipsHueWhiteAndColor);
  api.registerPlatform(PLATFORM_NAME, ZigbeeNTHomebridgePlatform);
};
