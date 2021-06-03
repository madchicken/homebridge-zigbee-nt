"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE_ACCESSORIES = void 0;
const types_1 = require("../types");
/**
 * Defines a set of known devices that will be configured using the {@link ConfigurableAccessory} class
 * Please, see {@link DeviceConfig} definition to understand how to map your ZigBee device.
 */
exports.DATABASE_ACCESSORIES = [
    {
        manufacturer: 'Xiaomi',
        models: ['JTQJ-BF-01LM/BW', 'lumi.sensor_natgas'],
        services: [
            {
                type: types_1.ServiceType.LEAK_SENSOR,
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
                type: types_1.ServiceType.BULB,
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
                type: types_1.ServiceType.BULB,
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
                type: types_1.ServiceType.BULB,
                meta: {
                    brightness: true,
                    colorXY: true,
                    colorTemp: true,
                },
            },
        ],
    },
    {
        manufacturer: 'TuYa',
        models: ['TS0121_plug'],
        services: [
            {
                type: types_1.ServiceType.OUTLET,
                meta: {
                    power: true,
                    current: true,
                    voltage: true,
                },
            },
        ],
    },
    {
        manufacturer: 'BTicino',
        models: ['L441C/N4411C/NT4411C'],
        services: [
            {
                type: types_1.ServiceType.BULB,
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
                type: types_1.ServiceType.MOTION_SENSOR,
                meta: {
                    tamper: true,
                    batteryLow: true,
                },
            },
        ],
    },
    {
        manufacturer: 'TUYATEC-p9HCE8pZ',
        models: ['TS0011'],
        services: [
            {
                type: types_1.ServiceType.BULB,
                meta: {
                    brightness: true,
                },
            },
        ],
    },
    {
        manufacturer: '_TZ3000_g5xawfcq',
        models: ['TS0121'],
        services: [
            {
                type: types_1.ServiceType.OUTLET,
                meta: {
                    power: true,
                    current: true,
                    voltage: true,
                },
            },
        ],
    },
];
//# sourceMappingURL=database.js.map