"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceBuilder = void 0;
const assert_1 = __importDefault(require("assert"));
class ServiceBuilder {
    constructor(platform, accessory, client, state) {
        assert_1.default(client !== null, 'ZigBee client must be initialized');
        assert_1.default(platform !== null, 'Platform plugin must be initialized');
        assert_1.default(accessory !== null, 'Platform Accessory must be initialized');
        this.platform = platform;
        this.accessory = accessory;
        this.client = client;
        this.state = state;
    }
    get device() {
        return this.accessory.context;
    }
    get log() {
        return this.platform.log;
    }
    build() {
        return this.service;
    }
    get Characteristic() {
        return this.platform.Characteristic;
    }
    get isOnline() {
        return this.platform.isDeviceOnline(this.device.ieeeAddr);
    }
    get friendlyName() {
        return this.platform.getDeviceFriendlyName(this.device.ieeeAddr);
    }
}
exports.ServiceBuilder = ServiceBuilder;
//# sourceMappingURL=service-builder.js.map