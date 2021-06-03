"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZigBeeController = exports.endpointNames = void 0;
const zigbee_herdsman_1 = require("zigbee-herdsman");
const zigbee_herdsman_converters_1 = require("zigbee-herdsman-converters");
exports.endpointNames = [
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
const DefaultOptions = {
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
class ZigBeeController {
    constructor(log) {
        this.herdsman = null;
        this.log = log;
    }
    init(config) {
        const options = Object.assign(Object.assign({}, DefaultOptions), {
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
        });
        this.herdsman = new zigbee_herdsman_1.Controller(options);
    }
    acceptJoiningDeviceHandler(ieeeAddr) {
        this.log.info(`Accepting joining whitelisted device '${ieeeAddr}'`);
        return Promise.resolve(true);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.herdsman.start();
        });
    }
    on(message, listener) {
        this.herdsman.on(message, listener);
    }
    off(message, listener) {
        this.herdsman.off(message, listener);
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.toggleLed(false);
            yield this.permitJoin(false);
            yield this.herdsman.stop();
        });
    }
    getCoordinatorVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.herdsman.getCoordinatorVersion();
        });
    }
    reset(type) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.herdsman.reset(type);
        });
    }
    permitJoin(permit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (permit === true) {
                this.log.info('Zigbee: allowing new devices to join.');
            }
            else {
                this.log.info('Zigbee: disabling joining new devices.');
            }
            yield this.herdsman.permitJoin(permit);
        });
    }
    getPermitJoin() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.herdsman.getPermitJoin();
        });
    }
    coordinator() {
        return this.herdsman.getDevicesByType('Coordinator')[0];
    }
    list() {
        return this.herdsman.getDevices().filter(device => device.type !== 'Coordinator');
    }
    device(ieeeAddr) {
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
    remove(ieeeAddr) {
        const device = this.herdsman.getDeviceByIeeeAddr(ieeeAddr);
        if (device) {
            return device.removeFromDatabase();
        }
        return Promise.reject(`Device ${ieeeAddr} not found`);
    }
    unregister(ieeeAddr) {
        const device = this.herdsman.getDeviceByIeeeAddr(ieeeAddr);
        if (device) {
            return device.removeFromDatabase();
        }
        return Promise.reject(`Device ${ieeeAddr} not found`);
    }
    toggleLed(on) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.herdsman) {
                const supported = yield this.herdsman.supportsLED();
                if (supported) {
                    return this.herdsman.setLED(on);
                }
            }
            return Promise.resolve();
        });
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
    resolveEntity(key) {
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
            let endpointKey = exports.endpointNames.find(p => key.endsWith(`/${p}`));
            const endpointByNumber = key.match(keyEndpointByNumber);
            if (!endpointKey && endpointByNumber) {
                endpointKey = Number(endpointByNumber[1]).toString();
            }
            if (endpointKey) {
                key = key.replace(`/${endpointKey}`, '');
            }
            // FIXME: handle groups
            return null;
        }
        else if (key.constructor.name === 'Device') {
            const definition = zigbee_herdsman_converters_1.findByDevice(key);
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
        }
        else {
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
    createGroup(groupID) {
        return this.herdsman.createGroup(groupID);
    }
    touchlinkFactoryReset() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.herdsman.touchlinkFactoryResetFirst();
        });
    }
    interview(ieeeAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.device(ieeeAddr).interview();
            return this.device(ieeeAddr);
        });
    }
}
exports.ZigBeeController = ZigBeeController;
//# sourceMappingURL=zigBee-controller.js.map