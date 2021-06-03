import { Logger } from 'homebridge';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import { ZigBeeControllerConfig, ZigBeeEntity } from './types';
export declare const endpointNames: string[];
export declare class ZigBeeController {
    private herdsman;
    private readonly log;
    constructor(log: Logger);
    init(config: ZigBeeControllerConfig): void;
    acceptJoiningDeviceHandler(ieeeAddr: any): Promise<boolean>;
    start(): Promise<any>;
    on(message: string, listener: (...args: any[]) => void): void;
    off(message: string, listener: (...args: any[]) => void): void;
    stop(): Promise<void>;
    getCoordinatorVersion(): Promise<any>;
    reset(type: any): Promise<any>;
    permitJoin(permit: boolean): Promise<void>;
    getPermitJoin(): Promise<any>;
    coordinator(): any;
    list(): Device[];
    device(ieeeAddr: string): any;
    endpoints(addr: any): any;
    find(addr: any, epId: any): any;
    ping(addr: any): any;
    remove(ieeeAddr: string): any;
    unregister(ieeeAddr: string): any;
    toggleLed(on: boolean): Promise<any>;
    /**
     * @param {string} key
     * @return {object} {
     *      type: device | coordinator
     *      device|group: zigbee-herdsman entity
     *      endpoint: selected endpoint (only if type === device)
     *      settings: from configuration.yaml
     *      name: name of the entity
     *      definition: zigbee-herdsman-converters definition (only if type === device)
     * }
     */
    resolveEntity(key: any): ZigBeeEntity;
    getGroupByID(ID: any): any;
    getGroups(): any;
    createGroup(groupID: number): any;
    touchlinkFactoryReset(): Promise<any>;
    interview(ieeeAddr: string): Promise<Device>;
}
//# sourceMappingURL=zigBee-controller.d.ts.map