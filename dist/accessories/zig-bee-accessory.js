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
exports.ZigBeeAccessory = void 0;
const assert_1 = __importDefault(require("assert"));
const async_retry_1 = __importDefault(require("async-retry"));
const lodash_1 = require("lodash");
const index_1 = require("../index");
const device_1 = require("../utils/device");
const hsb_type_1 = require("../utils/hsb-type");
const utils_1 = require("./utils");
const MAX_PING_ATTEMPTS = 1;
const MAX_NAME_LENGTH = 64;
function isValidValue(v) {
    return !lodash_1.isNull(v) && !lodash_1.isUndefined(v);
}
class ZigBeeAccessory {
    constructor(platform, accessory, client, device) {
        this.missedPing = 0;
        this.isConfiguring = false;
        this.client = client;
        this.ieeeAddr = device.ieeeAddr;
        this.platform = platform;
        this.log = this.platform.log;
        this.state = {};
        this.accessory = accessory;
        this.accessory.context = device;
        this.entity = this.client.resolveEntity(device);
        this.isOnline = true;
        assert_1.default(this.entity !== null, 'ZigBee Entity resolution failed');
        const Characteristic = platform.Characteristic;
        this.accessory
            .getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, device.manufacturerName)
            .setCharacteristic(Characteristic.Model, device.modelID)
            .setCharacteristic(Characteristic.SerialNumber, device.ieeeAddr)
            .setCharacteristic(Characteristic.SoftwareRevision, `${device.softwareBuildID}`)
            .setCharacteristic(Characteristic.HardwareRevision, `${device.hardwareVersion}`)
            .setCharacteristic(Characteristic.Name, this.friendlyName);
        this.accessory.on('identify', () => this.handleAccessoryIdentify());
    }
    /**
     * Perform initialization of the accessory. By default is creates services exposed by the
     * accessory by invoking {@link ZigBeeAccessory.getAvailableServices}
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mappedServices = this.getAvailableServices();
            try {
                this.onDeviceMount();
            }
            catch (e) {
                this.log.error(`Error mounting device ${this.friendlyName}: ${e.message}`);
            }
        });
    }
    handleAccessoryIdentify() { }
    get zigBeeDeviceDescriptor() {
        return this.accessory.context;
    }
    get zigBeeDefinition() {
        return this.entity.definition;
    }
    get friendlyName() {
        var _a, _b;
        const ieeeAddr = this.zigBeeDeviceDescriptor.ieeeAddr;
        return (((_b = (_a = this.entity) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.friendlyName) ||
            `${this.zigBeeDefinition.description.substr(0, MAX_NAME_LENGTH - 1 - ieeeAddr.length)}-${ieeeAddr}`);
    }
    onDeviceMount() {
        this.log.info(`Mounting device ${this.friendlyName}...`);
        if (device_1.isDeviceRouter(this.zigBeeDeviceDescriptor) &&
            this.platform.config.disableRoutingPolling !== true) {
            this.isOnline = false; // wait until we can ping the device
            this.log.info(`Device ${this.friendlyName} is a router, install ping`);
            this.interval = this.getPollingInterval();
            this.ping().then(() => this.log.debug(`Ping received from ${this.friendlyName}`));
        }
        else {
            this.configureDevice()
                .then(() => this.log.debug(`${this.friendlyName} successfully configured`))
                .catch(e => this.log.error(e.message));
        }
    }
    getPollingInterval() {
        let interval = this.platform.config.routerPollingInterval * 1000 || device_1.DEFAULT_POLL_INTERVAL;
        if (this.interval < device_1.MIN_POLL_INTERVAL || this.interval > device_1.MAX_POLL_INTERVAL) {
            interval = device_1.DEFAULT_POLL_INTERVAL;
        }
        return interval;
    }
    ping() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.zigBeeDeviceDescriptor.ping();
                yield this.configureDevice();
                this.zigBeeDeviceDescriptor.updateLastSeen();
                this.zigBeeDeviceDescriptor.save();
                this.missedPing = 0;
                this.isOnline = true;
                setTimeout(() => this.ping(), this.interval);
            }
            catch (e) {
                this.log.warn(`No response from ${this.entity.settings.friendlyName}. Is it online?`);
                this.missedPing++;
                if (this.missedPing > MAX_PING_ATTEMPTS) {
                    this.log.error(`Device is not responding after ${MAX_PING_ATTEMPTS} ping, sending it offline...`);
                    this.isOnline = false;
                    this.zigBeeDeviceDescriptor.save();
                }
                else {
                    setTimeout(() => this.ping(), this.interval);
                }
            }
        });
    }
    configureDevice() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.shouldConfigure()) {
                this.isConfiguring = true;
                const coordinatorEndpoint = this.client.getCoordinator().getEndpoint(1);
                return yield async_retry_1.default((bail, attempt) => __awaiter(this, void 0, void 0, function* () {
                    yield this.zigBeeDefinition.configure(this.zigBeeDeviceDescriptor, coordinatorEndpoint);
                    this.isConfigured = true;
                    this.zigBeeDeviceDescriptor.save();
                    this.log.info(`Device ${this.friendlyName} successfully configured on attempt ${attempt}!`);
                    return true;
                }), {
                    retries: MAX_PING_ATTEMPTS,
                    onRetry: (e, attempt) => {
                        if (attempt === MAX_PING_ATTEMPTS) {
                            this.isConfiguring = false;
                            this.isConfigured = false;
                            this.zigBeeDeviceDescriptor.save();
                        }
                    },
                });
            }
            return false;
        });
    }
    get isConfigured() {
        var _a;
        return !!((_a = this.zigBeeDefinition.meta) === null || _a === void 0 ? void 0 : _a.configured);
    }
    set isConfigured(val) {
        var _a;
        if (val === true) {
            this.zigBeeDefinition.meta.configured = this.zigBeeDefinition.meta.configureKey;
        }
        else {
            (_a = this.zigBeeDefinition.meta) === null || _a === void 0 ? true : delete _a.configured;
        }
    }
    shouldConfigure() {
        return (!!this.zigBeeDefinition.configure && // it must have the configure function defined
            !this.isConfigured &&
            !this.zigBeeDefinition.interviewing &&
            !this.isConfiguring);
    }
    internalUpdate(state) {
        try {
            this.log.debug(`Updating state of device ${this.friendlyName} with `, state);
            this.state = Object.assign(this.state, Object.assign({}, state));
            this.log.debug(`Updated state for device ${this.friendlyName} is now `, this.state);
            this.zigBeeDeviceDescriptor.updateLastSeen();
            this.configureDevice().then(configured => configured ? this.log.debug(`${this.friendlyName} configured after state update`) : null);
            this.update(Object.assign({}, this.state));
            delete this.state.action;
        }
        catch (e) {
            this.log.error(e.message, e);
        }
    }
    /**
     * This function handles most of the characteristics update you need.
     * Override this function only if you need some specific update feature for your accessory
     * @param state DeviceState Current device state
     */
    update(state) {
        const Service = this.platform.Service;
        const Characteristic = this.platform.Characteristic;
        this.mappedServices.forEach(service => {
            var _a, _b, _c, _d;
            this.log.debug(`Updating service ${service.UUID} for device ${this.friendlyName} with state`, state);
            if (this.supports('battery_low')) {
                service.updateCharacteristic(Characteristic.StatusLowBattery, state.battery_low
                    ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                    : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
            }
            if (this.supports('tamper')) {
                service.updateCharacteristic(Characteristic.StatusTampered, state.tamper
                    ? Characteristic.StatusTampered.TAMPERED
                    : Characteristic.StatusTampered.NOT_TAMPERED);
            }
            switch (service.UUID) {
                case Service.Battery.UUID:
                case Service.BatteryService.UUID:
                    if (isValidValue(state.battery)) {
                        service.updateCharacteristic(Characteristic.BatteryLevel, state.battery || 0);
                        service.updateCharacteristic(Characteristic.StatusLowBattery, state.battery && state.battery < 10);
                    }
                    break;
                case Service.ContactSensor.UUID:
                    service.updateCharacteristic(Characteristic.ContactSensorState, state.contact
                        ? Characteristic.ContactSensorState.CONTACT_DETECTED
                        : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
                    break;
                case Service.LeakSensor.UUID:
                    if (this.supports('water_leak')) {
                        service
                            .getCharacteristic(Characteristic.ContactSensorState)
                            .setValue(state.water_leak === true
                            ? Characteristic.LeakDetected.LEAK_DETECTED
                            : Characteristic.LeakDetected.LEAK_NOT_DETECTED);
                    }
                    if (this.supports('gas')) {
                        service
                            .getCharacteristic(Characteristic.ContactSensorState)
                            .setValue(state.gas === true
                            ? Characteristic.LeakDetected.LEAK_DETECTED
                            : Characteristic.LeakDetected.LEAK_NOT_DETECTED);
                    }
                    break;
                case Service.Switch.UUID:
                    if (isValidValue(state.state)) {
                        service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
                    }
                    break;
                case Service.Lightbulb.UUID:
                    if (isValidValue(state.state)) {
                        service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
                    }
                    if (this.supports('brightness')) {
                        if (isValidValue(state.brightness_percent)) {
                            service.updateCharacteristic(this.platform.Characteristic.Brightness, state.brightness_percent);
                        }
                        else if (isValidValue(state.brightness)) {
                            service.updateCharacteristic(this.platform.Characteristic.Brightness, Math.round(Number(state.brightness) / 2.55));
                        }
                    }
                    if (this.supports('color_temp') && isValidValue(state.color_temp)) {
                        service.updateCharacteristic(this.platform.Characteristic.ColorTemperature, state.color_temp);
                    }
                    if (this.supports('color_hs') && isValidValue((_a = state.color) === null || _a === void 0 ? void 0 : _a.s)) {
                        if (isValidValue((_b = state.color) === null || _b === void 0 ? void 0 : _b.s)) {
                            service.updateCharacteristic(this.platform.Characteristic.Saturation, state.color.s);
                        }
                        if (isValidValue((_c = state.color) === null || _c === void 0 ? void 0 : _c.hue)) {
                            service.updateCharacteristic(this.platform.Characteristic.Hue, state.color.hue);
                        }
                    }
                    else if (this.supports('color_xy') && isValidValue((_d = state.color) === null || _d === void 0 ? void 0 : _d.x)) {
                        const hsbType = hsb_type_1.HSBType.fromXY(state.color.x, state.color.y);
                        state.color.hue = hsbType.hue;
                        state.color.s = hsbType.saturation;
                        service.updateCharacteristic(Characteristic.Hue, state.color.hue);
                        service.updateCharacteristic(Characteristic.Saturation, state.color.s);
                    }
                    break;
                case Service.LightSensor.UUID:
                    if (this.supports('illuminance_lux') && isValidValue(state.illuminance_lux)) {
                        service.updateCharacteristic(Characteristic.CurrentAmbientLightLevel, state.illuminance_lux);
                    }
                    if (this.supports('illuminance') && isValidValue(state.illuminance)) {
                        service.updateCharacteristic(Characteristic.CurrentAmbientLightLevel, state.illuminance);
                    }
                    break;
                case Service.MotionSensor.UUID:
                    service.updateCharacteristic(this.platform.Characteristic.MotionDetected, state.occupancy === true);
                    break;
                case Service.Outlet.UUID:
                    if (isValidValue(state.state)) {
                        service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
                    }
                    if (this.supports('power') || this.supports('voltage') || this.supports('energy')) {
                        service.updateCharacteristic(this.platform.Characteristic.InUse, state.power > 0 || state.voltage > 0 || state.current > 0);
                        if (this.supports('power') && typeof state.power === 'number') {
                            service.updateCharacteristic(index_1.HAP.CurrentPowerConsumption, state.power);
                        }
                        if (this.supports('voltage') && typeof state.voltage === 'number') {
                            service.updateCharacteristic(index_1.HAP.CurrentVoltage, state.voltage);
                        }
                        if (this.supports('energy') && typeof state.current === 'number') {
                            service.updateCharacteristic(index_1.HAP.CurrentConsumption, state.current);
                        }
                    }
                    break;
                case Service.TemperatureSensor.UUID:
                    if (isValidValue(state.temperature)) {
                        service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, state.temperature);
                    }
                    break;
                case Service.HumiditySensor.UUID:
                    if (isValidValue(state.humidity)) {
                        service.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, state.humidity);
                    }
                    break;
                case Service.StatelessProgrammableSwitch.UUID:
                    this.handleButtonAction(state.action, service);
                    break;
            }
        });
    }
    handleButtonAction(action, service) {
        const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
        utils_1.doWithButtonAction(action, (event) => {
            service.getCharacteristic(ProgrammableSwitchEvent).setValue(event);
        });
    }
    supports(property) {
        var _a;
        return (((_a = this.entity.definition.exposes) === null || _a === void 0 ? void 0 : _a.find(capability => capability.name === property)) !== null);
    }
}
exports.ZigBeeAccessory = ZigBeeAccessory;
//# sourceMappingURL=zig-bee-accessory.js.map