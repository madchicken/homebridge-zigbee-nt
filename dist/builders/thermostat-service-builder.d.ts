import { PlatformAccessory } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { DeviceState, RunningState, SystemMode } from '../zigbee/types';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { ServiceBuilder } from './service-builder';
export declare function runningStateToCurrentHeatingCoolingState(val: RunningState): number;
export declare function translateCurrentStateFromSystemMode(val: SystemMode): number;
export declare function translateTargetStateFromSystemMode(val: SystemMode): number;
export declare function translateTargetStateToSystemMode(val: number): SystemMode;
export declare class ThermostatServiceBuilder extends ServiceBuilder {
    constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient, state: DeviceState);
    withCurrentHeatingCoolingState(): ThermostatServiceBuilder;
    withTargetHeatingCoolingState(asAuto?: [SystemMode], asOff?: [SystemMode]): ThermostatServiceBuilder;
    withCurrentTemperature(): ThermostatServiceBuilder;
    withTargetTemperature(min: number, max: number): ThermostatServiceBuilder;
}
export declare const MIN_TEMP = 10;
export declare const MAX_TEMP = 38;
export declare function getTemperatureFixer(min: number, max: number): (temp: number) => number;
//# sourceMappingURL=thermostat-service-builder.d.ts.map