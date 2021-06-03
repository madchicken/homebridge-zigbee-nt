"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.ZigbeeNTHomebridgePlatform = void 0;
const settings_1 = require("./settings");
const path = __importStar(require("path"));
const permit_join_accessory_1 = require("./accessories/permit-join-accessory");
const sleep_1 = require("./utils/sleep");
const parse_model_name_1 = require("./utils/parse-model-name");
const registry_1 = require("./registry");
const zig_bee_client_1 = require("./zigbee/zig-bee-client");
const touchlink_accessory_1 = require("./accessories/touchlink-accessory");
const http_server_1 = require("./web/api/http-server");
const fs = __importStar(require("fs"));
const configurable_accessory_1 = require("./accessories/configurable-accessory");
const lodash_1 = require("lodash");
const PERMIT_JOIN_ACCESSORY_NAME = 'zigbee:permit-join';
const TOUCH_LINK_ACCESSORY_NAME = 'zigbee:touchlink';
const DEFAULT_PAN_ID = 0x1a62;
class ZigbeeNTHomebridgePlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        const packageJson = JSON.parse(fs.readFileSync(`${path.resolve(__dirname, '../package.json')}`, 'utf-8'));
        this.accessories = new Map();
        this.homekitAccessories = new Map();
        this.permitJoinAccessory = null;
        this.PlatformAccessory = this.api.platformAccessory;
        this.log.info(`Initializing platform: ${this.config.name} - v${packageJson.version} (API v${api.version})`);
        if (config.devices) {
            config.devices.forEach(config => {
                this.log.info(`Registering custom configured device ${config.manufacturer} - ${config.models.join(', ')}`);
                registry_1.registerAccessoryFactory(config.manufacturer, config.models, (platform, accessory, client, device) => new configurable_accessory_1.ConfigurableAccessory(platform, accessory, client, device, config.services));
            });
        }
        this.api.on("didFinishLaunching" /* DID_FINISH_LAUNCHING */, () => this.startZigBee());
        this.api.on("shutdown" /* SHUTDOWN */, () => this.stopZigbee());
    }
    get zigBeeClient() {
        return this.client;
    }
    startZigBee() {
        return __awaiter(this, void 0, void 0, function* () {
            // Create client
            this.client = new zig_bee_client_1.ZigBeeClient(this.log, this.config.customDeviceSettings);
            const panId = this.config.panId && this.config.panId < 0xffff ? this.config.panId : DEFAULT_PAN_ID;
            const database = this.config.database || path.join(this.api.user.storagePath(), './zigBee.db');
            yield this.client.start({
                channel: this.config.channel,
                secondaryChannel: this.config.secondaryChannel,
                port: this.config.port,
                panId,
                database,
                adapter: this.config.adapter,
            });
            this.zigBeeClient.on('deviceAnnounce', (message) => this.handleDeviceAnnounce(message));
            this.zigBeeClient.on('deviceInterview', (message) => this.handleZigBeeDevInterview(message));
            this.zigBeeClient.on('deviceJoined', (message) => this.handleZigBeeDevJoined(message));
            this.zigBeeClient.on('deviceLeave', (message) => this.handleZigBeeDevLeaving(message));
            this.zigBeeClient.on('message', (message) => this.handleZigBeeMessage(message));
            yield this.handleZigBeeReady();
        });
    }
    stopZigbee() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.log.info('Stopping zigbee service');
                yield ((_a = this.zigBeeClient) === null || _a === void 0 ? void 0 : _a.stop());
                this.log.info('Stopping http server');
                yield ((_b = this.httpServer) === null || _b === void 0 ? void 0 : _b.stop());
                this.log.info('Successfully stopped ZigBee service');
            }
            catch (e) {
                this.log.error('Error while stopping ZigBee service', e);
            }
        });
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        this.accessories.set(accessory.UUID, accessory);
    }
    handleZigBeeDevInterview(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const ieeeAddr = message.device.ieeeAddr;
            const status = message.status;
            switch (status) {
                case 'failed':
                    this.log.error(`Interview progress ${status} for device ${this.getDeviceFriendlyName(ieeeAddr)}`);
                    break;
                case 'started':
                    this.log.info(`Interview progress ${status} for device ${this.getDeviceFriendlyName(ieeeAddr)}`);
                    break;
                case 'successful':
                    this.log.info(`Successfully interviewed device: ${message.device.manufacturerName} - ${message.device.modelID}`);
                    yield this.handleDeviceUpdate(message.device);
            }
        });
    }
    handleZigBeeDevJoined(message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info(`Device joined, Adding ${this.getDeviceFriendlyName(message.device.ieeeAddr)} (${message.device.manufacturerName} - ${message.device.modelID})`);
            return yield this.handleDeviceUpdate(message.device);
        });
    }
    handleDeviceUpdate(device) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ignore if the device exists
            const accessory = this.getHomekitAccessoryByIeeeAddr(device.ieeeAddr);
            if (!accessory) {
                // Wait a little bit for a database sync
                yield sleep_1.sleep(1500);
                const uuid = yield this.initDevice(device);
                return uuid !== null;
            }
            else {
                this.log.debug(`Not initializing device ${this.getDeviceFriendlyName(device.ieeeAddr)}: already mapped in Homebridge`);
                accessory.internalUpdate({});
            }
            return false;
        });
    }
    generateUUID(ieeeAddr) {
        return this.api.hap.uuid.generate(ieeeAddr);
    }
    handleZigBeeDevLeaving(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const ieeeAddr = message.ieeeAddr;
            // Stop permit join
            yield this.permitJoinAccessory.setPermitJoin(false);
            this.log.info(`Device announced leaving and will be removed, id: ${ieeeAddr}`);
            return yield this.unpairDevice(ieeeAddr);
        });
    }
    handleZigBeeReady() {
        return __awaiter(this, void 0, void 0, function* () {
            const info = this.zigBeeClient.getCoordinator();
            this.log.info(`ZigBee platform initialized @ ${info.ieeeAddr}`);
            // Set led indicator
            yield this.zigBeeClient.toggleLed(!this.config.disableLed);
            // Init permit join accessory
            yield this.initPermitJoinAccessory();
            // Init switch to reset devices through Touchlink feature
            this.initTouchLinkAccessory();
            // Init devices
            const paired = (yield Promise.all(this.zigBeeClient.getAllPairedDevices().map(device => this.initDevice(device)))).filter(uuid => uuid !== null);
            paired.push(this.permitJoinAccessory.accessory.UUID);
            paired.push(this.touchLinkAccessory.accessory.UUID);
            const missing = lodash_1.difference([...this.accessories.keys()], paired);
            missing.forEach(uuid => {
                this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [
                    this.accessories.get(uuid),
                ]);
                this.accessories.delete(uuid);
                this.homekitAccessories.delete(uuid);
            });
            if (this.config.disableHttpServer !== true) {
                try {
                    this.httpServer = new http_server_1.HttpServer(this.config.httpPort);
                    this.httpServer.start(this);
                }
                catch (e) {
                    this.log.error('WEB UI failed to start.', e);
                }
            }
            else {
                this.log.info('WEB UI disabled.');
            }
        });
    }
    getAccessoryByIeeeAddr(ieeeAddr) {
        return this.accessories.get(this.generateUUID(ieeeAddr));
    }
    getAccessoryByUUID(uuid) {
        return this.accessories.get(uuid);
    }
    getHomekitAccessoryByIeeeAddr(ieeeAddr) {
        return this.homekitAccessories.get(this.generateUUID(ieeeAddr));
    }
    getHomekitAccessoryByUUID(uuid) {
        return this.homekitAccessories.get(uuid);
    }
    initDevice(device) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = parse_model_name_1.parseModelName(device.modelID);
            const manufacturer = device.manufacturerName;
            const ieeeAddr = device.ieeeAddr;
            const deviceName = `${this.getDeviceFriendlyName(ieeeAddr)} - ${model} - ${manufacturer}`;
            this.log.info(`Initializing ZigBee device: ${deviceName}`);
            if (!registry_1.isAccessorySupported(device)) {
                this.log.info(`Unsupported ZigBee device: ${this.getDeviceFriendlyName(ieeeAddr)} - ${model} - ${manufacturer}`);
                return null;
            }
            else {
                try {
                    const accessory = this.createHapAccessory(ieeeAddr);
                    const homeKitAccessory = registry_1.createAccessoryInstance(this, accessory, this.client, device);
                    if (homeKitAccessory) {
                        this.log.info('Registered device:', homeKitAccessory.friendlyName, manufacturer, model);
                        yield homeKitAccessory.initialize(); // init services
                        this.homekitAccessories.set(accessory.UUID, homeKitAccessory);
                        return accessory.UUID;
                    }
                }
                catch (e) {
                    this.log.error(`Error initializing device ${deviceName}`, e);
                }
                return null;
            }
        });
    }
    mountDevice(ieeeAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const UUID = this.generateUUID(ieeeAddr);
                const zigBeeAccessory = this.getHomekitAccessoryByUUID(UUID);
                if (zigBeeAccessory) {
                    return yield zigBeeAccessory.onDeviceMount();
                }
            }
            catch (error) {
                this.log.warn(`Unable to initialize device ${this.getDeviceFriendlyName(ieeeAddr)}, ` +
                    'try to remove it and add it again.\n');
                this.log.warn('Reason:', error);
            }
        });
    }
    initPermitJoinAccessory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accessory = this.createHapAccessory(PERMIT_JOIN_ACCESSORY_NAME);
                this.permitJoinAccessory = new permit_join_accessory_1.PermitJoinAccessory(this, accessory, this.zigBeeClient);
                this.log.info('PermitJoin accessory successfully registered');
                if (this.config.enablePermitJoin === true) {
                    yield this.permitJoinAccessory.setPermitJoin(true);
                }
            }
            catch (e) {
                this.log.error('PermitJoin accessory not registered: ', e);
            }
        });
    }
    initTouchLinkAccessory() {
        try {
            const accessory = this.createHapAccessory(TOUCH_LINK_ACCESSORY_NAME);
            this.touchLinkAccessory = new touchlink_accessory_1.TouchlinkAccessory(this, accessory, this.zigBeeClient);
            this.log.info('TouchLink accessory successfully registered');
        }
        catch (e) {
            this.log.error('TouchLink accessory not registered: ', e);
        }
    }
    createHapAccessory(name) {
        const uuid = this.generateUUID(name);
        const existingAccessory = this.getAccessoryByUUID(uuid);
        if (existingAccessory) {
            this.log.info(`Reuse accessory from cache with uuid ${uuid} and name ${name}`);
            return existingAccessory;
        }
        else {
            const accessory = new this.PlatformAccessory(name, uuid);
            this.log.warn(`Registering new accessory with uuid ${uuid} and name ${name}`);
            this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
            this.accessories.set(uuid, accessory);
            return accessory;
        }
    }
    removeAccessory(ieeeAddr) {
        const uuid = this.generateUUID(ieeeAddr);
        const accessory = this.accessories.get(uuid);
        if (accessory) {
            this.accessories.delete(uuid);
            this.homekitAccessories.delete(uuid);
        }
    }
    unpairDevice(ieeeAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.zigBeeClient.unpairDevice(ieeeAddr);
            if (result) {
                this.log.info('Device has been unpaired:', ieeeAddr);
                const accessory = this.getAccessoryByIeeeAddr(ieeeAddr);
                if (accessory) {
                    this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
                    this.removeAccessory(ieeeAddr);
                    return true;
                }
            }
            else {
                this.log.error('Device has NOT been unpaired:', ieeeAddr);
            }
            return false;
        });
    }
    handleDeviceAnnounce(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const ieeeAddr = message.device.ieeeAddr;
            this.log.info(`Device announce: ${this.getDeviceFriendlyName(ieeeAddr)} (${message.device.manufacturerName} - ${message.device.modelID})`);
            if (message.device.interviewCompleted) {
                let uuid = (_a = this.getAccessoryByIeeeAddr(ieeeAddr)) === null || _a === void 0 ? void 0 : _a.UUID;
                if (!uuid) {
                    // Wait a little bit for a database sync
                    yield sleep_1.sleep(1500);
                    uuid = yield this.initDevice(message.device);
                    if (!uuid) {
                        this.log.warn(`Device not recognized: `, message);
                        return;
                    }
                }
                return this.getHomekitAccessoryByUUID(uuid).onDeviceMount();
            }
            else {
                this.log.warn(`Not initializing device ${this.getDeviceFriendlyName(ieeeAddr)}: interview process still not completed`);
            }
        });
    }
    handleZigBeeMessage(message) {
        this.log.debug(`Zigbee message from ${this.getDeviceFriendlyName(message.device.ieeeAddr)}`, message);
        const zigBeeAccessory = this.getHomekitAccessoryByIeeeAddr(message.device.ieeeAddr);
        if (zigBeeAccessory) {
            this.client.decodeMessage(message, (ieeeAddr, state) => {
                this.log.debug(`Decoded state from incoming message`, state);
                zigBeeAccessory.internalUpdate(state);
            }); // if the message is decoded, it will call the statePublisher function
        }
    }
    getDeviceFriendlyName(ieeeAddr) {
        var _a, _b;
        return (((_b = (_a = this.config.customDeviceSettings) === null || _a === void 0 ? void 0 : _a.find(config => config.ieeeAddr === ieeeAddr)) === null || _b === void 0 ? void 0 : _b.friendlyName) || ieeeAddr);
    }
    isDeviceOnline(ieeeAddr) {
        const zigBeeAccessory = this.getHomekitAccessoryByIeeeAddr(ieeeAddr);
        if (zigBeeAccessory) {
            return zigBeeAccessory.isOnline;
        }
        return false;
    }
}
exports.ZigbeeNTHomebridgePlatform = ZigbeeNTHomebridgePlatform;
//# sourceMappingURL=platform.js.map