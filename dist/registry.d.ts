import { PlatformAccessory } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ZigBeeAccessory, ZigBeeAccessoryCtor, ZigBeeAccessoryFactory } from './accessories/zig-bee-accessory';
import { ZigbeeNTHomebridgePlatform } from './platform';
import { ZigBeeClient } from './zigbee/zig-bee-client';
export declare function clearRegistries(): void;
/**
 * Register a class to map a given device model (or models) of a manufacturer
 * (or set of manufacturers)
 * @param manufacturer name or names of manufacturers
 * @param models name or names of device models
 * @param clazz the accessory class to register
 */
export declare function registerAccessoryClass(manufacturer: string | string[], models: string[], clazz: ZigBeeAccessoryCtor): void;
/**
 * Register a factory to build an accessory for a given device model (or models)
 * of a manufacturer (or set of manufacturers)
 * @param manufacturer name or names of manufacturers
 * @param models name or names of device models
 * @param factory the factory to register
 */
export declare function registerAccessoryFactory(manufacturer: string | string[], models: string[], factory: ZigBeeAccessoryFactory): void;
export declare function createAccessoryInstance(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, device: Device): ZigBeeAccessory;
export declare function isAccessorySupported(device: Device): boolean;
//# sourceMappingURL=registry.d.ts.map