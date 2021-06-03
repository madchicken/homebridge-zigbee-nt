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
exports.LockServiceBuilder = void 0;
const service_builder_1 = require("./service-builder");
class LockServiceBuilder extends service_builder_1.ServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform, accessory, client, state);
        this.service =
            this.accessory.getService(platform.Service.LockMechanism) ||
                this.accessory.addService(platform.Service.LockMechanism);
    }
    withLockState() {
        const Characteristic = this.platform.Characteristic;
        this.state.state = 'LOCK';
        this.service
            .getCharacteristic(Characteristic.LockTargetState)
            .on("set" /* SET */, (yes, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                Object.assign(this.state, yield this.client.setLockState(this.device, yes));
                callback();
            }
            catch (e) {
                callback(e);
            }
        }));
        this.service
            .getCharacteristic(Characteristic.LockCurrentState)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.client.getLockState(this.device).catch(e => this.log.error(e.message));
                const locked = this.state.state === 'LOCK' || this.state.lock_state === 'locked';
                const notFullyLocked = this.state.lock_state === 'not_fully_locked';
                callback(null, locked
                    ? Characteristic.LockCurrentState.SECURED
                    : notFullyLocked
                        ? Characteristic.LockCurrentState.JAMMED
                        : Characteristic.LockCurrentState.UNSECURED);
            }
            catch (e) {
                callback(e);
            }
        }));
        return this;
    }
}
exports.LockServiceBuilder = LockServiceBuilder;
//# sourceMappingURL=lock-service-builder.js.map