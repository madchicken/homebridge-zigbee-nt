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
  {
    manufacturer: 'BTicino',
    models: ['L441C/N4411C/NT4411C'],
    services: [
      {
        type: 'bulb',
        meta: {
          brightness: true,
        },
      },
    ],
  },
  {
    manufacturer: 'Philips',
    models: ['LTC001'],
    services: [
      {
        type: 'bulb',
        meta: {
          brightness: true,
          colorTemp: true,
        },
      },
    ],
  },
  {
    manufacturer: '_TZ3000_riwp3k79',
    models: ['TS0505A'],
    services: [
      {
        type: 'bulb',
        meta: {
          brightness: true,
          colorXY: true,
          colorTemp: true,
        },
      },
    ],
  },
  {
    manufacturer: 'BTicino',
    models: ['L441C/N4411C/NT4411C'],
    services: [
      {
        type: 'bulb',
        meta: {
          brightness: true,
        },
      },
    ],
  },
  {
    manufacturer: '_TZ1800_fcdjzz3s',
    models: ['TY0202'],
    services: [
      {
        type: 'motion-sensor',
        meta: {
          tamper: true,
          batteryLow: true,
        },
      },
    ],
  },
];
