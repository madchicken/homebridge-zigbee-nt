import { Controller } from 'zigbee-herdsman';
import { EventEmitter } from 'events';
import { findByDevice } from 'zigbee-herdsman-converters';
import Endpoint from 'zigbee-herdsman/dist/controller/model/endpoint';
import { Logger } from 'homebridge';

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
const keyEndpointByNumber = new RegExp(`.*/([0-9]*)$`);

export interface ZigBeeDevice {
  type: string,
  ieeeAddr: string,
  networkAddress: number,
  manufacturerID: number,
  endpoints: Endpoint[],
  manufacturerName: string,
  powerSource: string,
  modelID: string,
  applicationVersion: number,
  stackVersion: number,
  zclVersion: number,
  hardwareVersion: number,
  dateCode: string,
  softwareBuildID: string,
  interviewCompleted: boolean,
  interviewing: boolean,
  lastSeen: number
}

/* eslint-disable no-underscore-dangle */
export class ZigBee extends EventEmitter {
  private herdsman: Controller;
  private readonly log: Logger;

  constructor(log: Logger = console) {
    super();
    this.herdsman = null;
    this.log = log;
  }

  init(config) {
    this.herdsman = new Controller({
      serialPort: {
        baudRate: 115200,
        rtscts: true,
        path: config.port,
        adapter: 'zstack',
      },
      databasePath: config.db,
      acceptJoiningDeviceHandler: ieeeAddr => this.acceptJoiningDeviceHandler(ieeeAddr),
      network: {
        networkKeyDistribute: false,
        networkKey: [
          0x01,
          0x03,
          0x05,
          0x07,
          0x09,
          0x0b,
          0x0d,
          0x0f,
          0x00,
          0x02,
          0x04,
          0x06,
          0x08,
          0x0a,
          0x0c,
          0x0d,
        ],
        panID: 0x1a62,
        extendedPanID: [0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd],
        channelList: [11],
      },
      databaseBackupPath: null,
      backupPath: null,
      adapter: null,
    });
  }

  acceptJoiningDeviceHandler(ieeeAddr) {
    this.log.info(`Accepting joining whitelisted device '${ieeeAddr}'`);
    return Promise.resolve(true);
  }

  async start() {
    await this.herdsman.start();
    this.herdsman.on('adapterDisconnected', () => this.emit('adapterDisconnected'));
    this.herdsman.on('deviceAnnounce', data => this.emit('event', 'deviceAnnounce', data));
    this.herdsman.on('deviceInterview', data => this.emit('event', 'deviceInterview', data));
    this.herdsman.on('deviceJoined', data => this.emit('event', 'deviceJoined', data));
    this.herdsman.on('deviceLeave', data => this.emit('event', 'deviceLeave', data));
    this.herdsman.on('message', data => this.emit('event', 'message', data));
  }

  async stop() {
    await this.herdsman.stop();
  }

  async getCoordinatorVersion() {
    return this.herdsman.getCoordinatorVersion();
  }

  async reset(type) {
    await this.herdsman.reset(type);
  }

  async permitJoin(permit) {
    permit
      ? this.log.info('Zigbee: allowing new devices to join.')
      : this.log.info('Zigbee: disabling joining new devices.');

    await this.herdsman.permitJoin(permit);
  }

  async getPermitJoin() {
    return this.herdsman.getPermitJoin();
  }

  coordinator() {
    return this.herdsman.getDevicesByType('Coordinator')[0];
  }

  list(): ZigBeeDevice[] {
    return this.herdsman.getDevices().filter(device => device.type !== 'Coordinator');
  }

  device(addr) {
    return this.herdsman.getDeviceByIeeeAddr(addr);
  }

  endpoints(addr) {
    return this.device(addr).endpoints.map(endpoint => this.find(addr, endpoint));
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

  remove(addr) {
    return this.herdsman.getDeviceByIeeeAddr(addr).removeFromDatabase();
  }

  unregister(addr) {
    const device = this.herdsman.getDeviceByIeeeAddr(addr);
    return device.removeFromDatabase();
  }

  async toggleLed(on: boolean) {
    const supported = await this.herdsman.supportsLED();
    if (supported) {
      return this.herdsman.setLED(on);
    }
    return Promise.resolve();
  }

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
  resolveEntity(key: any) {
    if (typeof key === 'string') {
      if (key.toLowerCase() === 'coordinator') {
        const coordinator = this.coordinator();
        return {
          type: 'device',
          device: coordinator,
          endpoint: coordinator.getEndpoint(1),
          settings: { friendlyName: 'Coordinator' },
          name: 'Coordinator',
        };
      }

      let endpointKey = endpointNames.find(p => key.endsWith(`/${p}`));
      const endpointByNumber = key.match(keyEndpointByNumber);
      if (!endpointKey && endpointByNumber) {
        endpointKey = Number(endpointByNumber[1]).toString();
      }
      if (endpointKey) {
        key = key.replace(`/${endpointKey}`, '');
      }

      // FIXME
      return null;
    } /* istanbul ignore else newApi */ else if (key.constructor.name === 'Device') {
      return {
        type: 'device',
        device: key,
        endpoint: key.endpoints[0],
        name: key.type === 'Coordinator' ? 'Coordinator' : key.ieeeAddr,
        definition: findByDevice(key),
      };
    } else {
      // Group
      return {
        type: 'group',
        group: key,
        name: 'Group',
      };
    }
  }

  getGroupByID(ID) {
    return this.herdsman.getGroupByID(ID);
  }

  getGroups() {
    return this.herdsman.getGroups();
  }

  createGroup(groupID) {
    return this.herdsman.createGroup(groupID);
  }
}
