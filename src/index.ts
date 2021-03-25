import fakegato from 'fakegato-history';
import { API, Formats, Perms, Units } from 'homebridge';
import { registerSupportedDevices } from './devices-registration';
import { ZigbeeNTHomebridgePlatform } from './platform';

import { PLATFORM_NAME, PLUGIN_IDENTIFIER } from './settings';
import { ExtraHAPTypes } from './types';

export let HomebridgeAPI: API;
export const HAP: ExtraHAPTypes = {
  Service: null,
  Characteristic: null,
  PlatformAccessory: null,
  CurrentPowerConsumption: null,
  TotalConsumption: null,
  CurrentVoltage: null,
  CurrentConsumption: null,
  FakeGatoHistoryService: null,
};

export function initCustomCharacteristics(homebridge: API): void {
  HAP.Service = homebridge.hap.Service;
  HAP.Characteristic = homebridge.hap.Characteristic;
  HAP.PlatformAccessory = homebridge.platformAccessory;
  HAP.FakeGatoHistoryService = fakegato(homebridge);

  HAP.CurrentPowerConsumption = class CurrentPowerConsumption extends HAP.Characteristic {
    public static readonly UUID: string = 'E863F10D-079E-48FF-8F27-9C2605A29F52';

    constructor() {
      super('CurrentConsumption', CurrentPowerConsumption.UUID, {
        format: Formats.UINT16,
        unit: 'watts' as Units, // ??
        maxValue: 100000,
        minValue: 0,
        minStep: 1,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY],
      });
    }
  };

  HAP.CurrentVoltage = class CurrentVoltage extends HAP.Characteristic {
    public static readonly UUID: string = 'E863F10A-079E-48FF-8F27-9C2605A29F52';

    constructor() {
      super('CurrentVoltage', CurrentVoltage.UUID, {
        format: Formats.UINT16,
        unit: 'volts' as Units, // ??
        maxValue: 1000,
        minValue: 0,
        minStep: 1,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY],
      });
    }
  };

  HAP.CurrentConsumption = class CurrentConsumption extends HAP.Characteristic {
    public static readonly UUID: string = 'E863F126-079E-48FF-8F27-9C2605A29F52';

    constructor() {
      super('CurrentConsumption', CurrentConsumption.UUID, {
        format: Formats.UINT16,
        unit: 'ampere' as Units, // ??
        maxValue: 1000,
        minValue: 0,
        minStep: 1,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY],
      });
    }
  };

  HAP.TotalConsumption = class TotalConsumption extends HAP.Characteristic {
    public static readonly UUID: string = 'E863F10C-079E-48FF-8F27-9C2605A29F52';

    constructor() {
      super('TotalConsumption', TotalConsumption.UUID, {
        format: Formats.FLOAT,
        unit: 'kWh' as Units, // ??
        minValue: 0,
        minStep: 0.001,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY],
      });
    }
  };
}

/**
 * This method registers the platform with Homebridge
 */
export default function(homebridge: API): void {
  HomebridgeAPI = homebridge;
  initCustomCharacteristics(homebridge);
  registerSupportedDevices();
  homebridge.registerPlatform(PLUGIN_IDENTIFIER, PLATFORM_NAME, ZigbeeNTHomebridgePlatform);
}
