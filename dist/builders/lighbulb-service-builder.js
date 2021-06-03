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
exports.LighbulbServiceBuilder = void 0;
const lodash_1 = require("lodash");
const service_builder_1 = require("./service-builder");
const hsb_type_1 = require("../utils/hsb-type");
class LighbulbServiceBuilder extends service_builder_1.ServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform, accessory, client, state);
        state.state = 'OFF';
        this.service =
            this.accessory.getService(platform.Service.Lightbulb) ||
                this.accessory.addService(platform.Service.Lightbulb);
    }
    withOnOff() {
        const Characteristic = this.Characteristic;
        this.service
            .getCharacteristic(Characteristic.On)
            .on("set" /* SET */, (yes, callback) => __awaiter(this, void 0, void 0, function* () {
            if (this.isOnline) {
                try {
                    Object.assign(this.state, yield this.client.setOnState(this.device, yes));
                    return callback();
                }
                catch (e) {
                    return callback(e);
                }
            }
            else {
                return callback(new Error('Device is offline'));
            }
        }));
        this.service
            .getCharacteristic(Characteristic.On)
            .on("get" /* GET */, (callback) => {
            if (this.isOnline) {
                this.client.getOnOffState(this.device).catch(e => {
                    this.log.error(e.message);
                });
                return callback(null, this.state.state === 'ON');
            }
            else {
                return callback(new Error('Device is offline'));
            }
        });
        return this;
    }
    withBrightness() {
        const Characteristic = this.Characteristic;
        this.state.brightness_percent = 100;
        this.service
            .getCharacteristic(Characteristic.Brightness)
            .on("set" /* SET */, (brightnessPercent, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isOnline) {
                    Object.assign(this.state, yield this.client.setBrightnessPercent(this.device, brightnessPercent));
                    return callback();
                }
                else {
                    return callback(new Error('Device is offline'));
                }
            }
            catch (e) {
                return callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.Brightness)
            .on("get" /* GET */, (callback) => {
            if (this.isOnline) {
                this.client.getBrightnessPercent(this.device).catch(e => {
                    this.log.error(e.message);
                });
                this.log.debug(`Reading Brightness for ${this.friendlyName}: ${this.state.brightness_percent}`);
                return callback(null, lodash_1.get(this.state, 'brightness_percent', 100));
            }
            else {
                return callback(new Error('Device is offline'));
            }
        });
        return this;
    }
    withColorTemperature() {
        const Characteristic = this.Characteristic;
        this.state.color_temp = 140;
        this.service
            .getCharacteristic(Characteristic.ColorTemperature)
            .on("set" /* SET */, (colorTemperature, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isOnline) {
                    Object.assign(this.state, yield this.client.setColorTemperature(this.device, colorTemperature));
                    return callback();
                }
                else {
                    return callback(new Error('Device is offline'));
                }
            }
            catch (e) {
                return callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.ColorTemperature)
            .on("get" /* GET */, (callback) => {
            if (this.isOnline) {
                this.client.getColorTemperature(this.device).catch(e => this.log.error(e.message));
                this.log.debug(`Reading Color temp for ${this.friendlyName}: ${this.state.color_temp}`);
                return callback(null, lodash_1.get(this.state, 'color_temp', 140));
            }
            else {
                return callback(new Error('Device is offline'));
            }
        });
        return this;
    }
    withHue() {
        const Characteristic = this.Characteristic;
        this.state.color = Object.assign(Object.assign({}, this.state.color), { hue: 360 });
        this.service
            .getCharacteristic(Characteristic.Hue)
            .on("set" /* SET */, (hue, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isOnline) {
                    Object.assign(this.state, yield this.client.setHue(this.device, hue));
                    return callback();
                }
                else {
                    return callback(new Error('Device is offline'));
                }
            }
            catch (e) {
                return callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.Hue)
            .on("get" /* GET */, (callback) => {
            if (this.isOnline) {
                this.log.debug(`[light-bulb-service] Reading HUE for ${this.friendlyName}: ${this.state.color.hue}`);
                callback(null, lodash_1.get(this.state, 'color.hue', 360));
                return this.client
                    .getHue(this.device)
                    .catch(e => this.log.error(`[light-bulb-service] Error reading HUE: ${e.message}`));
            }
            else {
                this.log.warn(`[light-bulb-service] ${this.friendlyName} is offline, skipping GET Hue`);
                return callback(new Error('Device is offline'));
            }
        });
        return this;
    }
    /**
     * Special treatment for bulbs supporting HS color
     * HomeKit only knows about HSB, so we need to manually convert values
     */
    withColorHS() {
        return this.withHue()
            .withSaturation()
            .withBrightness();
    }
    /**
     * Special treatment for bulbs supporting only XY colors (IKEA Tådfri for example)
     * HomeKit only knows about HSB, so we need to manually convert values
     */
    withColorXY() {
        const Characteristic = this.Characteristic;
        this.state.brightness_percent = 100;
        this.state.color = Object.assign(Object.assign({}, this.state.color), { s: 100, hue: 360 });
        this.service
            .getCharacteristic(Characteristic.Hue)
            .on("set" /* SET */, (h, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isOnline) {
                    const s = this.service.getCharacteristic(Characteristic.Saturation).value;
                    const v = this.service.getCharacteristic(Characteristic.Brightness).value;
                    const hsbType = new hsb_type_1.HSBType(h, s, v);
                    const [r, g, b] = hsbType.toRGB();
                    yield this.client.setColorRGB(this.device, r, g, b);
                    return callback();
                }
                else {
                    return callback(new Error('Device is offline'));
                }
            }
            catch (e) {
                return callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.Hue)
            .on("get" /* GET */, (callback) => {
            if (this.isOnline) {
                this.client.getColorXY(this.device).catch(e => this.log.error(e.message));
                this.log.debug(`Reading HUE for ${this.friendlyName}: ${this.state.color.hue}`);
                return callback(null, lodash_1.get(this.state, 'color.hue', 360));
            }
            else {
                return callback(new Error('Device is offline'));
            }
        });
        this.service
            .getCharacteristic(Characteristic.Saturation)
            .on("set" /* SET */, (saturation, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isOnline) {
                    const v = this.service.getCharacteristic(Characteristic.Brightness).value;
                    const hue = this.service.getCharacteristic(Characteristic.Hue).value;
                    const hsbType = new hsb_type_1.HSBType(hue, saturation, v);
                    const [r, g, b] = hsbType.toRGB();
                    yield this.client.setColorRGB(this.device, r, g, b);
                    return callback();
                }
                else {
                    return callback(new Error('Device is offline'));
                }
            }
            catch (e) {
                return callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.Saturation)
            .on("get" /* GET */, (callback) => {
            if (this.isOnline) {
                this.client.getColorXY(this.device).catch(e => this.log.error(e.message));
                return callback(null, lodash_1.get(this.state, 'color.s', 100));
            }
            else {
                return callback(new Error('Device is offline'));
            }
        });
        this.service
            .getCharacteristic(Characteristic.Brightness)
            .on("set" /* SET */, (brightnessPercent, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isOnline) {
                    yield this.client.setBrightnessPercent(this.device, brightnessPercent);
                    return callback();
                }
                else {
                    return callback(new Error('Device is offline'));
                }
            }
            catch (e) {
                return callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.Brightness)
            .on("get" /* GET */, (callback) => {
            if (this.isOnline) {
                this.client.getBrightnessPercent(this.device).catch(e => {
                    this.log.error(e.message);
                });
                this.log.debug(`Reading Brightness for ${this.friendlyName}: ${this.state.brightness_percent}`);
                return callback(null, lodash_1.get(this.state, 'brightness_percent', 100));
            }
            else {
                return callback(new Error('Device is offline'));
            }
        });
        return this;
    }
    withSaturation() {
        const Characteristic = this.platform.Characteristic;
        this.state.color = Object.assign(Object.assign({}, this.state.color), { s: 100 });
        this.service
            .getCharacteristic(Characteristic.Saturation)
            .on("set" /* SET */, (saturation, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isOnline) {
                    yield this.client.setSaturation(this.device, saturation);
                    return callback();
                }
                else {
                    return callback(new Error('Device is offline'));
                }
            }
            catch (e) {
                return callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.Saturation)
            .on("get" /* GET */, (callback) => {
            if (this.isOnline) {
                this.log.debug(`Reading Saturation for ${this.friendlyName}: ${this.state.color.s}`);
                this.client.getSaturation(this.device).catch(e => this.log.error(e.message));
                callback(null, lodash_1.get(this.state, 'color.s', 100));
            }
            else {
                return callback(new Error('Device is offline'));
            }
        });
        return this;
    }
}
exports.LighbulbServiceBuilder = LighbulbServiceBuilder;
//# sourceMappingURL=lighbulb-service-builder.js.map