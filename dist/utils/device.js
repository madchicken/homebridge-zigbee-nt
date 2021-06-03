"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDeviceRouter = exports.MAX_POLL_INTERVAL = exports.MIN_POLL_INTERVAL = exports.DEFAULT_POLL_INTERVAL = void 0;
exports.DEFAULT_POLL_INTERVAL = 30 * 1000;
exports.MIN_POLL_INTERVAL = 10 * 1000;
exports.MAX_POLL_INTERVAL = 120 * 1000;
function isDeviceRouter(device) {
    let power = 'unknown';
    if (device.powerSource) {
        power = device.powerSource.toLowerCase().split(' ')[0];
    }
    if (power !== 'battery' && power !== 'unknown' && device.type === 'Router') {
        return true;
    }
}
exports.isDeviceRouter = isDeviceRouter;
//# sourceMappingURL=device.js.map