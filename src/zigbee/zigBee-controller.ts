import { Controller } from 'zigbee-herdsman';
import { findByDevice } from 'zigbee-herdsman-converters';
import { Logger } from 'homebridge';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import { ZigBeeControllerConfig, ZigBeeDefinition, ZigBeeEntity } from './types';
import Group from 'zigbee-herdsman/dist/controller/model/group';
import { CoordinatorVersion, StartResult } from 'zigbee-herdsman/dist/adapter/tstype';

export const endpointNames = [
  'left',
  'right',
  'center',
  'bottom_left',
  'bottom_right',
  'default',
  'top_left',
  'top_right',
  'white',
  'rgb',
  'cct',
  'system',
  'top',
  'bottom',
  'center_left',
  'center_right',
  'ep1',
  'ep2',
  'row_1',
  'row_2',
  'row_3',
  'row_4',
  'relay',
  'l1',
  'l2',
  'l3',
  'l4',
  'l5',
  'l6',
  'l7',
  'l8',
  'button_1',
  'button_2',
  'button_3',
  'button_4',
  'button_5',
  'button_6',
  'button_7',
  'button_8',
  'button_9',
  'button_10',
  'button_11',
  'button_12',
  'button_13',
  'button_14',
  'button_15',
  'button_16',
  'button_17',
  'button_18',
  'button_19',
  'button_20',
];
// const keyEndpointByNumber = new RegExp(`.*/([0-9]*)$`);

/* eslint-disable no-underscore-dangle */
export class ZigBeeController {
  private herdsman: Controller;
  private readonly log: Logger;
  private groupLookup: {[s: number]: Group} = {};
  private deviceLookup: {[s: string]: Device} = {};

  constructor(log: Logger) {
    this.herdsman = null;
    this.log = log;
  }

  init(config: ZigBeeControllerConfig): void {
    const options = {
      serialPort: {
        path: config.port,
        adapter: config.adapter,
      },
      databasePath: config.databasePath,
      databaseBackupPath: `${config.databasePath}.${Date.now()}`,
      acceptJoiningDeviceHandler: (ieeeAddr: string) => this.acceptJoiningDeviceHandler(ieeeAddr),
      backupPath: null,
      adapter: { disableLED: false },
      network: {
        panID: config.panId || 0x1a62,
        channelList: config.channels,
      },
    };
    this.herdsman = new Controller(options);
  }

  acceptJoiningDeviceHandler(ieeeAddr: string): Promise<boolean> {
    this.log.info(`Accepting joining whitelisted device '${ieeeAddr}'`);
    return Promise.resolve(true);
  }

  async start(): Promise<StartResult> {
    return await this.herdsman.start();
  }

  on(message: string, listener: (...args: any[]) => void): void {
    this.herdsman.on(message, listener);
  }

  off(message: string, listener: (...args: any[]) => void): void {
    this.herdsman.off(message, listener);
  }

  async stop(): Promise<void> {
    await this.permitJoin(false);
    return await this.herdsman.stop();
  }

  async getCoordinatorVersion(): Promise<CoordinatorVersion> {
    return this.herdsman.getCoordinatorVersion();
  }

  async reset(type: 'hard' | 'soft'): Promise<void> {
    return await this.herdsman.reset(type);
  }

  async permitJoin(permit: boolean): Promise<void> {
    if (permit === true) {
      this.log.info('Zigbee: allowing new devices to join.');
    } else {
      this.log.info('Zigbee: disabling joining new devices.');
    }

    await this.herdsman.permitJoin(permit);
  }

  async getPermitJoin() {
    return this.herdsman.getPermitJoin();
  }

  coordinator() {
    return this.herdsman.getDevicesByType('Coordinator')[0];
  }

  list(): Device[] {
    return this.herdsman.getDevices().filter((device) => device.type !== 'Coordinator');
  }

  device(ieeeAddr: string) {
    return this.herdsman.getDeviceByIeeeAddr(ieeeAddr);
  }

  endpoints(addr) {
    return this.device(addr).endpoints.map((endpoint) => this.find(addr, endpoint));
  }

  find(addr, epId) {
    return this.herdsman.getDeviceByIeeeAddr(addr).getEndpoint(epId);
  }

  ping(addr) {
    const device = this.herdsman.getDeviceByIeeeAddr(addr);
    if (device) {
      return device.ping();
    }
  }

  remove(ieeeAddr: string) {
    const device = this.herdsman.getDeviceByIeeeAddr(ieeeAddr);
    if (device) {
      return device.removeFromDatabase();
    }
    return Promise.reject(`Device ${ieeeAddr} not found`);
  }

  unregister(ieeeAddr: string) {
    const device = this.herdsman.getDeviceByIeeeAddr(ieeeAddr);
    if (device) {
      return device.removeFromDatabase();
    }
    return Promise.reject(`Device ${ieeeAddr} not found`);
  }

  private resolveDevice(ieeeAddr: string): Device {
    if (!this.deviceLookup[ieeeAddr]) {
      const device = this.herdsman.getDeviceByIeeeAddr(ieeeAddr);
      if (device) {
        this.deviceLookup[ieeeAddr] = device;
      }
    }

    const device = this.deviceLookup[ieeeAddr];
    if (device && !device.isDeleted) {
      return device;
    }
  }

  private resolveGroup(groupID: number): Group {
    const group = this.herdsman.getGroupByID(Number(groupID));
    if (group && !this.groupLookup[groupID]) {
      this.groupLookup[groupID] = group;
    }

    return this.groupLookup[groupID];
  }

  resolveEntity(key: string | number | Device): ZigBeeEntity {
    if (typeof key === 'object') {
      const resolvedDevice = this.resolveDevice(key.ieeeAddr);
      const definition: ZigBeeDefinition = findByDevice(key);
      return {
        type: 'device',
        device: resolvedDevice,
        endpoints: resolvedDevice.endpoints,
        name: resolvedDevice.ieeeAddr,
        definition,
        settings: {},
      };
    } else if (typeof key === 'string' && key.toLowerCase() === 'coordinator') {
      const coordinator = this.resolveDevice(this.herdsman.getDevicesByType('Coordinator')[0].ieeeAddr);
      return {
        type: 'device',
        device: coordinator,
        endpoints: coordinator.endpoints,
        name: 'Coordinator',
        settings: { friendlyName: 'Coordinator' },
      };
    } else if (typeof key === 'string') {
      const resolvedDevice = this.resolveDevice(key);
      const definition: ZigBeeDefinition = findByDevice(resolvedDevice);
      return {
        type: 'device',
        device: resolvedDevice,
        endpoints: resolvedDevice.endpoints,
        name: resolvedDevice.ieeeAddr,
        definition,
        settings: {},
      };
    } else if (typeof key === 'number') {
      const group = this.resolveGroup(key as number) || this.createGroup(key as number);
      return {
        type: 'group',
        group: group,
        name: `${group.groupID}`,
        settings: {},
      };
    }
    return null
  }

  getGroupByID(id: number): Group {
    return this.herdsman.getGroupByID(id);
  }

  getGroups(): Group[] {
    return this.herdsman.getGroups();
  }

  createGroup(groupID: number): Group {
    return this.herdsman.createGroup(groupID);
  }

  async touchlinkFactoryReset(): Promise<boolean> {
    return this.herdsman.touchlinkFactoryResetFirst();
  }

  async interview(ieeeAddr: string): Promise<Device> {
    await this.device(ieeeAddr).interview();
    return this.device(ieeeAddr);
  }
}
