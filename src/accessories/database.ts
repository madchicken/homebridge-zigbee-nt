import { DeviceConfig } from '../types';

/**
 * Defines a set of known devices that will be configured using the {@link ConfigurableAccessory} class
 * Please, see {@link DeviceConfig} definition to understand how to map your ZigBee device.
 */
export const DATABASE_ACCESSORIES: DeviceConfig[] = [
  {
    manufacturer: 'Xiaomi',
    models: ['JTQJ-BF-01LM/BW', 'lumi.sensor_natgas'],
    services: [
      {
        type: 'leak-sensor',
        meta: {
          batteryLow: true,
          gasLeak: true,
          tamper: true,
        },
      },
    ],
  },
];
