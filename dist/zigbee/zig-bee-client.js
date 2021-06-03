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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZigBeeClient = void 0;
const async_retry_1 = __importDefault(require("async-retry"));
const find_serial_port_1 = require("../utils/find-serial-port");
const sleep_1 = require("../utils/sleep");
const zigBee_controller_1 = require("./zigBee-controller");
class ZigBeeClient {
    constructor(log, customDeviceSettings = []) {
        this.zigBee = new zigBee_controller_1.ZigBeeController(log);
        this.log = log;
        this.deviceSettingsMap = new Map(customDeviceSettings.map(s => [s.ieeeAddr, s]));
    }
    start(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const channels = [config.channel];
            const secondaryChannel = parseInt(config.secondaryChannel);
            if (!isNaN(secondaryChannel) && !channels.includes(secondaryChannel)) {
                channels.push(secondaryChannel);
            }
            const port = config.port || (yield find_serial_port_1.findSerialPort());
            this.log.info(`Configured port for ZigBee dongle is ${port}`);
            const initConfig = {
                port,
                databasePath: config.database,
                panId: config.panId,
                channels,
                adapter: config.adapter || 'zstack',
            };
            this.log.info(`Initializing ZigBee controller on port ${initConfig.port} and channels ${initConfig.channels.join(', ')} (pan ID ${config.panId})`);
            this.zigBee.init(initConfig);
            const retrier = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.zigBee.start();
                    this.log.info('Successfully started ZigBee service');
                    return true;
                }
                catch (error) {
                    this.log.error(error);
                    yield this.zigBee.stop();
                    throw error;
                }
            });
            try {
                return yield async_retry_1.default(retrier, {
                    retries: 20,
                    minTimeout: 5000,
                    maxTimeout: 5000,
                    onRetry: () => this.log.info('Retrying connect to hardware'),
                });
            }
            catch (error) {
                this.log.info('error:', error);
                return false;
            }
        });
    }
    resolveEntity(device) {
        const resolvedEntity = this.zigBee.resolveEntity(device);
        if (!resolvedEntity) {
            this.log.error(`Entity '${device}' is unknown`);
            return null;
        }
        resolvedEntity.settings = this.getDeviceSetting(resolvedEntity.device);
        return resolvedEntity;
    }
    getDeviceSetting(device) {
        return this.deviceSettingsMap.get(device.ieeeAddr) || { friendlyName: device.ieeeAddr };
    }
    decodeMessage(message, callback) {
        const resolvedEntity = this.resolveEntity(message.device);
        const state = {};
        if (resolvedEntity) {
            const meta = { device: message.device };
            const converters = resolvedEntity.definition.fromZigbee.filter(c => {
                const type = Array.isArray(c.type)
                    ? c.type.includes(message.type)
                    : c.type === message.type;
                return c.cluster === message.cluster && type;
            });
            converters.forEach(converter => {
                const options = this.deviceSettingsMap.get(message.device.ieeeAddr) || { ieeeAddr: message.device.ieeeAddr };
                const converted = converter.convert(resolvedEntity.definition, message, (state) => {
                    callback(message.device.ieeeAddr, state);
                }, options, meta);
                if (converted) {
                    Object.assign(state, converted);
                }
            });
        }
        callback(message.device.ieeeAddr, state);
    }
    readDeviceState(device, message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const resolvedEntity = this.resolveEntity(device);
            const converters = this.mapConverters(this.getKeys(message), resolvedEntity.definition);
            const deviceState = {};
            const usedConverters = new Map();
            const target = resolvedEntity.endpoint;
            for (const [key, converter] of converters.entries()) {
                if ((_a = usedConverters.get(target.ID)) === null || _a === void 0 ? void 0 : _a.includes(converter)) {
                    // Use a converter only once (e.g. light_onoff_brightness converters can convert state and brightness)
                    continue;
                }
                this.log.debug(`Reading KEY '${key}' from '${resolvedEntity.settings.friendlyName}'`);
                try {
                    Object.assign(deviceState, yield converter.convertGet(target, key, { device, message }));
                }
                catch (error) {
                    this.log.error(`Reading '${key}' for '${resolvedEntity.settings.friendlyName}' failed: '${error}'`);
                    this.log.debug(error.stack);
                }
                if (!usedConverters.has(target.ID)) {
                    usedConverters.set(target.ID, []);
                }
                usedConverters.get(target.ID).push(converter);
            }
            this.log.debug(`Device state (${resolvedEntity.settings.friendlyName}): `, deviceState);
            return deviceState;
        });
    }
    writeDeviceState(device, state, options = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const resolvedEntity = this.resolveEntity(device);
            const converters = this.mapConverters(this.getKeys(state), resolvedEntity.definition);
            const definition = resolvedEntity.definition;
            const target = resolvedEntity.endpoint;
            const meta = {
                options,
                message: state,
                logger: this.log,
                device,
                state: state,
                mapped: definition,
            };
            const deviceState = Object.assign({}, state);
            const usedConverters = new Map();
            for (const [key, converter] of converters.entries()) {
                const value = state[key];
                if ((_a = usedConverters.get(target.ID)) === null || _a === void 0 ? void 0 : _a.includes(converter)) {
                    // Use a converter only once (e.g. light_onoff_brightness converters can convert state and brightness)
                    continue;
                }
                try {
                    this.log.debug(`Writing '${key}' to '${resolvedEntity.name}'`);
                    const result = yield converter.convertSet(target, key, value, meta);
                    this.log.debug('Result from zigbee (SET)', result);
                    // It's possible for devices to get out of sync when writing an attribute that's not reportable.
                    // So here we re-read the value after a specified timeout, this timeout could for example be the
                    // transition time of a color change or for forcing a state read for devices that don't
                    // automatically report a new state when set.
                    // When reporting is requested for a device (report: true in device-specific settings) we won't
                    // ever issue a read here, as we assume the device will properly report changes.
                    // Only do this when the retrieve_state option is enabled for this device.
                    if (resolvedEntity.type === 'device' && result && result.readAfterWriteTime) {
                        yield sleep_1.sleep(result.readAfterWriteTime);
                        yield converter.convertGet(target, key, meta);
                    }
                    Object.assign(deviceState, result.state);
                }
                catch (error) {
                    const message = `Writing '${key}' to '${resolvedEntity.name}' failed with converter ${converter.key.join(', ')}: '${error}'`;
                    this.log.error(message);
                    this.log.debug(error.stack);
                }
                if (!usedConverters.has(target.ID)) {
                    usedConverters.set(target.ID, []);
                }
                usedConverters.get(target.ID).push(converter);
            }
            return deviceState;
        });
    }
    /**
     * Creates a map of key => converter to use when talking with the dongle
     * @param keys an array of keys we want to extract
     * @param definition the zigbee definition of the device
     * @private
     */
    mapConverters(keys, definition) {
        return keys.reduce((converters, key) => {
            const converter = definition.toZigbee.find(c => c.key.includes(key));
            if (!converter) {
                // Thjs should really never happen!
                throw new Error(`No converter available for '${key}'`);
            }
            converters.set(key, converter);
            return converters;
        }, new Map());
    }
    getKeys(json) {
        const keys = Object.keys(json);
        const sorter = json.state === 'OFF' ? 1 : -1;
        keys.sort(a => ['state', 'brightness', 'brightness_percent'].includes(a) ? sorter : sorter * -1);
        return keys;
    }
    interview(ieeeAddr) {
        return this.zigBee.interview(ieeeAddr);
    }
    setOnState(device, on) {
        return this.writeDeviceState(device, { state: on ? 'ON' : 'OFF' });
    }
    getOnOffState(device) {
        return this.readDeviceState(device, { state: '' });
    }
    setLockState(device, on) {
        return this.writeDeviceState(device, { state: on ? 'LOCK' : 'UNLOCK' });
    }
    getLockState(device) {
        return this.getOnOffState(device);
    }
    getPowerState(device) {
        return this.readDeviceState(device, { power: 1 });
    }
    getCurrentState(device) {
        return this.readDeviceState(device, { current: 1 });
    }
    getVoltageState(device) {
        return this.readDeviceState(device, { voltage: 1 });
    }
    getColorXY(device) {
        return this.readDeviceState(device, { color: { x: 1, y: 1 } });
    }
    getBrightnessPercent(device) {
        return __awaiter(this, void 0, void 0, function* () {
            const deviceState = yield this.readDeviceState(device, { brightness: 1 });
            deviceState.brightness_percent = Math.round(Number(deviceState.brightness) / 2.55);
            return deviceState;
        });
    }
    setBrightnessPercent(device, brightnessPercent) {
        return __awaiter(this, void 0, void 0, function* () {
            const brightness = Math.round(Number(brightnessPercent) * 2.55);
            return this.writeDeviceState(device, {
                brightness,
            });
        });
    }
    getColorCapabilities(device, force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const colorCapabilities = (yield this.getClusterAttribute(device, 'lightingColorCtrl', 'colorCapabilities', force));
            return {
                colorTemperature: (colorCapabilities & (1 << 4)) > 0,
                colorXY: (colorCapabilities & (1 << 3)) > 0,
            };
        });
    }
    getClusterAttribute(device, cluster, attribute, force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolvedEntity = this.zigBee.resolveEntity(device);
            const endpoint = resolvedEntity.endpoint;
            if (endpoint.getClusterAttributeValue(cluster, attribute) === undefined || force) {
                yield endpoint.read(cluster, [attribute]);
            }
            return endpoint.getClusterAttributeValue(cluster, attribute);
        });
    }
    getSaturation(device) {
        return this.readDeviceState(device, { color: { s: 1 } });
    }
    getHue(device) {
        return this.readDeviceState(device, { color: { hue: 1 } });
    }
    setHue(device, hue) {
        return this.writeDeviceState(device, { color: { hue } });
    }
    setColorXY(device, x, y) {
        return this.writeDeviceState(device, { color: { x, y } });
    }
    setColorRGB(device, r, g, b) {
        return this.writeDeviceState(device, { color: { rgb: `${r},${g},${b}` } });
    }
    getLocalTemperature(device) {
        return this.readDeviceState(device, { local_temperature: 0 });
    }
    setCurrentHeatingSetpoint(device, temperature) {
        return this.writeDeviceState(device, { current_heating_setpoint: temperature });
    }
    setSystemMode(device, state) {
        return this.writeDeviceState(device, { system_mode: state });
    }
    getSystemMode(device) {
        return this.readDeviceState(device, { system_mode: 'off' });
    }
    getTemperature(device) {
        return this.readDeviceState(device, { temperature: 1 });
    }
    getHumidity(device) {
        return this.readDeviceState(device, { humidity: 1 });
    }
    getCoordinator() {
        return this.zigBee.coordinator();
    }
    identify(device) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeDeviceState(device, { alert: 'select' });
        });
    }
    setSaturation(device, saturation) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeDeviceState(device, { color: { s: saturation } });
        });
    }
    getColorTemperature(device) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.readDeviceState(device, {
                color_temp: 1,
            });
        });
    }
    setColorTemperature(device, colorTemperature) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeDeviceState(device, {
                color_temp: colorTemperature,
            });
        });
    }
    setLeftButtonOn(device, on) {
        return this.writeDeviceState(device, { state_left: on ? 'ON' : 'OFF' });
    }
    setRightButtonOn(device, on) {
        return this.writeDeviceState(device, { state_right: on ? 'ON' : 'OFF' });
    }
    getAllPairedDevices() {
        return this.zigBee.list();
    }
    getDevice(ieeeAddr) {
        return this.zigBee.device(ieeeAddr);
    }
    permitJoin(value) {
        return this.zigBee.permitJoin(value);
    }
    getPermitJoin() {
        return this.zigBee.getPermitJoin();
    }
    stop() {
        return this.zigBee.stop();
    }
    touchlinkFactoryReset() {
        return this.zigBee.touchlinkFactoryReset();
    }
    unpairDevice(ieeeAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.log.info('Unpairing device:', ieeeAddr);
                yield this.zigBee.remove(ieeeAddr);
                return true; // unpaired!
            }
            catch (error) {
                this.log.error(error);
                this.log.info('Unable to unpairing properly, trying to unregister device:', ieeeAddr);
                try {
                    yield this.zigBee.unregister(ieeeAddr);
                    return true; // unregistered!
                }
                catch (e) {
                    this.log.error(e);
                }
            }
            return false; // something went wrong
        });
    }
    on(message, listener) {
        this.zigBee.on(message, listener);
    }
    toggleLed(state) {
        return this.zigBee.toggleLed(state);
    }
    ping(ieeeAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.zigBee.ping(ieeeAddr);
        });
    }
    setCustomState(device, state) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeDeviceState(device, state);
        });
    }
    getState(device, state) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.readDeviceState(device, state);
        });
    }
    getCoordinatorVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.zigBee.getCoordinatorVersion();
        });
    }
    isUpdateFirmwareAvailable(device, request = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const zigBeeEntity = this.zigBee.resolveEntity(device);
            if (zigBeeEntity.definition.ota) {
                return zigBeeEntity.definition.ota.isUpdateAvailable(device, this.log, request);
            }
            return false;
        });
    }
    updateFirmware(device, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const zigBeeEntity = this.zigBee.resolveEntity(device);
            if (zigBeeEntity.definition.ota) {
                return zigBeeEntity.definition.ota.updateToLatest(device, this.log, onProgress);
            }
        });
    }
    hasOTA(device) {
        const zigBeeEntity = this.zigBee.resolveEntity(device);
        return !!(zigBeeEntity === null || zigBeeEntity === void 0 ? void 0 : zigBeeEntity.definition.ota);
    }
    bindOrUnbind(operation, sourceId, targetId, clusters) {
        return __awaiter(this, void 0, void 0, function* () {
            const clusterCandidates = [
                'genScenes',
                'genOnOff',
                'genLevelCtrl',
                'lightingColorCtrl',
                'closuresWindowCovering',
            ];
            const defaultBindGroup = {
                type: 'group_number',
                ID: 901,
                settings: { friendlyName: 'Default Group' },
            };
            const source = this.resolveEntity(this.zigBee.device(sourceId));
            const target = targetId === 'default_bind_group'
                ? defaultBindGroup
                : this.resolveEntity(this.zigBee.device(targetId));
            this.log.info(`${operation}ing ${sourceId} from ${targetId} (clusters ${clusters.join(', ')})`);
            const successfulClusters = [];
            const failedClusters = [];
            yield Promise.all(clusterCandidates.map((cluster) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const targetValid = target.type === 'group' ||
                    target.type === 'group_number' ||
                    target.device.type === 'Coordinator' ||
                    target.endpoint.supportsInputCluster(cluster);
                if (clusters && clusters.includes(cluster)) {
                    if (source.endpoint.supportsOutputCluster(cluster) && targetValid) {
                        const sourceName = source.device.ieeeAddr;
                        const targetName = (_a = target.device) === null || _a === void 0 ? void 0 : _a.ieeeAddr;
                        this.log.debug(`${operation}ing cluster '${cluster}' from '${source.settings.friendlyName ||
                            sourceName}' to '${target.settings.friendlyName}'`);
                        try {
                            let bindTarget;
                            if (target.type === 'group')
                                bindTarget = target.group;
                            else if (target.type === 'group_number')
                                bindTarget = target.ID;
                            else
                                bindTarget = target.endpoint;
                            if (operation === 'bind') {
                                yield source.endpoint.bind(cluster, bindTarget);
                            }
                            else {
                                this.log.info(`Unbinding ${cluster} from ${bindTarget}`);
                                yield source.endpoint.unbind(cluster, bindTarget);
                                this.log.info(`Done unbinding ${cluster} from ${bindTarget}`);
                            }
                            successfulClusters.push(cluster);
                            this.log.info(`Successfully ${operation === 'bind' ? 'bound' : 'unbound'} cluster '${cluster}' from ` + `'${sourceName}' to '${targetName}'`);
                        }
                        catch (error) {
                            failedClusters.push(cluster);
                            this.log.error(`Failed to ${operation} cluster '${cluster}' from '${sourceName}' to ` +
                                `'${targetName}' (${error})`);
                        }
                    }
                }
                else {
                    this.log.warn(`Clusters don't include ${cluster} (${clusters.join(', ')})`);
                }
            })));
            return {
                successfulClusters,
                failedClusters,
            };
        });
    }
    bind(sourceId, targetId, clusters) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bindOrUnbind('bind', sourceId, targetId, clusters);
        });
    }
    unbind(sourceId, targetId, clusters) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bindOrUnbind('unbind', sourceId, targetId, clusters);
        });
    }
}
exports.ZigBeeClient = ZigBeeClient;
//# sourceMappingURL=zig-bee-client.js.map