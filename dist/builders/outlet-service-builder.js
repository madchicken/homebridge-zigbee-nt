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
exports.OutletServiceBuilder = void 0;
const index_1 = require("../index");
const service_builder_1 = require("./service-builder");
const lodash_1 = require("lodash");
class OutletServiceBuilder extends service_builder_1.ServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform, accessory, client, state);
        this.service =
            this.accessory.getService(platform.Service.Outlet) ||
                this.accessory.addService(platform.Service.Outlet);
    }
    withOnOff() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.On)
            .on("set" /* SET */, (on, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.client.setOnState(this.device, on);
                Object.assign(this.state, status);
                callback();
            }
            catch (e) {
                callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.On)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            this.client.getOnOffState(this.device).catch(e => this.log.error(e.message));
            callback(null, lodash_1.get(this.state, 'state', 'OFF') === 'ON');
        }));
        return this;
    }
    withPower() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.OutletInUse)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            this.client.getPowerState(this.device).catch(e => this.log.error(e.message));
            callback(null, lodash_1.get(this.state, 'power', 0) > 0);
        }));
        this.service.addOptionalCharacteristic(index_1.HAP.CurrentPowerConsumption);
        return this;
    }
    withVoltage() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.OutletInUse)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            this.client.getVoltageState(this.device).catch(e => this.log.error(e.message));
            callback(null, lodash_1.get(this.state, 'voltage', 0) > 0);
        }));
        this.service.addOptionalCharacteristic(index_1.HAP.CurrentVoltage);
        return this;
    }
    withCurrent() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.OutletInUse)
            .on("get" /* GET */, (callback) => {
            this.client.getCurrentState(this.device).catch(e => this.log.error(e.message));
            callback(null, lodash_1.get(this.state, 'current', 0) > 0);
        });
        this.service.addOptionalCharacteristic(index_1.HAP.CurrentConsumption);
        return this;
    }
    build() {
        return this.service;
    }
}
exports.OutletServiceBuilder = OutletServiceBuilder;
//# sourceMappingURL=outlet-service-builder.js.map