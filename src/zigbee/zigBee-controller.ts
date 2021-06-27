import { Controller } from 'zigbee-herdsman';
import { findByDevice } from 'zigbee-herdsman-converters';
import { Logger } from 'homebridge';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import { ZigBeeControllerConfig, ZigBeeDefinition, ZigBeeEntity } from './types';

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

interface NetworkOptions {
  panID: number;
  extendedPanID?: number[];
  channelList: number[];
  networkKey?: number[];
  networkKeyDistribute?: boolean;
}

interface SerialPortOptions {
  baudRate?: number;
  rtscts?: boolean;
  path?: string;
  adapter?: 'zstack' | 'deconz' | 'zigate';
}

interface AdapterOptions {
  concurrent?: number;
  delay?: number;
}

interface Options {
  network: NetworkOptions;
  serialPort: SerialPortOptions;
  databasePath: string;
  databaseBackupPath: string;
  backupPath: string;
  adapter: AdapterOptions;
  /**
   * This lambda can be used by an application to explictly reject or accept an incoming device.
   * When false is returned zigbee-herdsman will not start the interview process and immidiately
   * try to remove the device from the network.
   */
  acceptJoiningDeviceHandler: (ieeeAddr: string) => Promise<boolean>;
}

const DefaultOptions: Options = {
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
  serialPort: {},
  databasePath: null,
  databaseBackupPath: null,
  backupPath: null,
  adapter: null,
  acceptJoiningDeviceHandler: null,
};

/* eslint-disable no-underscore-dangle */
export class ZigBeeController {
  private herdsman: Controller;
  private readonly log: Logger;

  constructor(log: Logger) {
    this.herdsman = null;
    this.log = log;
  }

  init(config: ZigBeeControllerConfig): void {
    const options: Options = {
      ...DefaultOptions,
      ...{
        serialPort: {
          path: config.port,
          adapter: config.adapter,
        },
        databasePath: config.databasePath,
        databaseBackupPath: `${config.databasePath}.${Date.now()}`,
        acceptJoiningDeviceHandler: ieeeAddr => this.acceptJoiningDeviceHandler(ieeeAddr),
        network: {
          panID: config.panId || 0x1a62,
          channelList: config.channels,
        },
      },
    };
    this.herdsman = new Controller(options);
  }

  acceptJoiningDeviceHandler(ieeeAddr: string): Promise<boolean> {
    this.log.info(`Accepting joining whitelisted device '${ieeeAddr}'`);
    return Promise.resolve(true);
  }

  async start() {
    await this.herdsman.start();
  }

  on(message: string, listener: (...args: any[]) => void) {
    this.herdsman.on(message, listener);
  }

  off(message: string, listener: (...args: any[]) => void) {
    this.herdsman.off(message, listener);
  }

  async stop() {
    await this.toggleLed(false);
    await this.permitJoin(false);
    await this.herdsman.stop();
  }

  async getCoordinatorVersion() {
    return this.herdsman.getCoordinatorVersion();
  }

  async reset(type) {
    await this.herdsman.reset(type);
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
    return this.herdsman.getDevices().filter(device => device.type !== 'Coordinator');
  }

  device(ieeeAddr: string) {
    return this.herdsman.getDeviceByIeeeAddr(ieeeAddr);
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

  async toggleLed(on: boolean) {
    if (this.herdsman) {
      const supported = await this.herdsman.supportsLED();
      if (supported) {
        return this.herdsman.setLED(on);
      }
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
  resolveEntity(key: any): ZigBeeEntity {
    if (typeof key === 'string') {
      if (key.toLowerCase() === 'coordinator') {
        const coordinator = this.coordinator();
        return {
          type: 'device',
          device: coordinator,
          endpoint: coordinator.getEndpoint(1),
          name: 'Coordinator',
          settings: { friendlyName: 'Coordinator' },
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

      // FIXME: handle groups
      return null;
    } else if (key.constructor.name === 'Device') {
      const definition: ZigBeeDefinition = findByDevice(key);
      if (!definition) {
        return null;
      }
      return {
        type: 'device',
        device: key,
        endpoint: key.endpoints[0],
        name: key.type === 'Coordinator' ? 'Coordinator' : key.ieeeAddr,
        definition,
        settings: { friendlyName: key.ieeeAddr },
      };
    } else {
      // Group
      return {
        type: 'group',
        group: key,
        name: 'Group',
        settings: {},
      };
    }
  }

  getGroupByID(ID) {
    return this.herdsman.getGroupByID(ID);
  }

  getGroups() {
    return this.herdsman.getGroups();
  }

  createGroup(groupID: number) {
    return this.herdsman.createGroup(groupID);
  }

  async touchlinkFactoryReset() {
    return this.herdsman.touchlinkFactoryResetFirst();
  }

  async interview(ieeeAddr: string): Promise<Device> {
    await this.device(ieeeAddr).interview();
    return this.device(ieeeAddr);
  }
}
