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
exports.DevicesService = void 0;
class DevicesService {
    static fetchDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('/api/devices');
            if (response.ok) {
                const json = yield response.json();
                return {
                    result: 'success',
                    devices: json.devices,
                    total: json.devices.length,
                };
            }
            else {
                throw new Error(yield response.text());
            }
        });
    }
    static fetchDevice(ieeeAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/api/devices/${ieeeAddr}`);
            if (response.ok) {
                const json = yield response.json();
                return {
                    result: 'success',
                    device: json.device,
                };
            }
            else {
                throw new Error(yield response.text());
            }
        });
    }
    static deleteDevice(ieeeAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/api/devices/${ieeeAddr}`, {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json',
                },
            });
            if (response.ok) {
                const json = yield response.json();
                return {
                    result: 'success',
                    device: json.device,
                };
            }
            else {
                throw new Error(yield response.text());
            }
        });
    }
    static getDeviceState(ieeeAddr, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/api/devices/${ieeeAddr}/get`, {
                method: 'POST',
                body: JSON.stringify(state),
                headers: {
                    'content-type': 'application/json',
                },
            });
            if (response.ok) {
                const json = yield response.json();
                return {
                    result: 'success',
                    state: json.state,
                };
            }
            else {
                throw new Error(yield response.text());
            }
        });
    }
    static setDeviceState(ieeeAddr, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/api/devices/${ieeeAddr}/set`, {
                method: 'POST',
                body: JSON.stringify(state),
                headers: {
                    'content-type': 'application/json',
                },
            });
            if (response.ok) {
                const json = yield response.json();
                return {
                    result: 'success',
                    state: json.state,
                };
            }
            else {
                throw new Error(yield response.text());
            }
        });
    }
    static pingDevice(ieeeAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/api/devices/${ieeeAddr}/ping`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
            });
            if (response.ok) {
                const json = yield response.json();
                return {
                    result: 'success',
                    state: json,
                };
            }
            else {
                throw new Error(yield response.text());
            }
        });
    }
    static unbind(ieeeAddr, target, clusters) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/api/devices/${ieeeAddr}/unbind`, {
                method: 'POST',
                body: JSON.stringify({ target, clusters }),
                headers: {
                    'content-type': 'application/json',
                },
            });
            if (response.ok) {
                const json = yield response.json();
                return {
                    result: 'success',
                    state: json,
                };
            }
            else {
                throw new Error(yield response.text());
            }
        });
    }
    static checkForUpdates(ieeeAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/api/devices/${ieeeAddr}/checkForUpdates`, {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                },
            });
            if (response.ok) {
                const json = yield response.json();
                return {
                    result: 'success',
                    state: json,
                };
            }
            else {
                throw new Error(yield response.text());
            }
        });
    }
}
exports.DevicesService = DevicesService;
//# sourceMappingURL=devices.js.map