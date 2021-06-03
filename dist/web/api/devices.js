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
exports.mapDevicesRoutes = void 0;
const http2_1 = require("http2");
const utils_1 = require("../common/utils");
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({ transports: [new winston_1.default.transports.Console()] });
function mapDevicesRoutes(express, platform, _webSocket) {
    express.get('/api/devices', (_req, res) => {
        const devices = platform.zigBeeClient.getAllPairedDevices();
        res.status(http2_1.constants.HTTP_STATUS_OK);
        res.contentType('application/json');
        res.end(JSON.stringify({ devices: devices.map(device => utils_1.normalizeDeviceModel(device)) }));
    });
    express.get('/api/devices/:ieeeAddr', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
        if (device) {
            const deviceModel = utils_1.normalizeDeviceModel(device);
            deviceModel.otaAvailable = platform.zigBeeClient.hasOTA(device);
            res.status(http2_1.constants.HTTP_STATUS_OK);
            res.contentType('application/json');
            res.end(JSON.stringify({ device: deviceModel }));
        }
        else {
            res.status(http2_1.constants.HTTP_STATUS_NOT_FOUND);
            res.end();
        }
    }));
    express.get('/api/devices/:ieeeAddr/checkForUpdates', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
        if (device) {
            let newFirmwareAvailable = 'NO';
            if (platform.zigBeeClient.hasOTA(device)) {
                try {
                    newFirmwareAvailable = (yield platform.zigBeeClient.isUpdateFirmwareAvailable(device))
                        ? 'YES'
                        : 'NO';
                }
                catch (e) {
                    logger.error(e.toString(), e);
                    newFirmwareAvailable = 'FETCH_ERROR';
                }
            }
            res.status(http2_1.constants.HTTP_STATUS_OK);
            res.contentType('application/json');
            res.end(JSON.stringify({ newFirmwareAvailable }));
        }
        else {
            res.status(http2_1.constants.HTTP_STATUS_NOT_FOUND);
            res.end();
        }
    }));
    express.delete('/api/devices/:ieeeAddr', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
        if (device) {
            yield platform.unpairDevice(req.params.ieeeAddr);
            res.status(http2_1.constants.HTTP_STATUS_OK);
            res.contentType('application/json');
            res.end(JSON.stringify({ device: utils_1.normalizeDeviceModel(device) }));
        }
        else {
            res.status(http2_1.constants.HTTP_STATUS_NOT_FOUND);
            res.end();
        }
    }));
    express.post('/api/devices/:ieeeAddr/set', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
            if (device) {
                const state = yield platform.zigBeeClient.setCustomState(device, req.body);
                res.status(http2_1.constants.HTTP_STATUS_OK);
                res.contentType('application/json');
                res.end(JSON.stringify({ state }));
            }
            else {
                res.status(http2_1.constants.HTTP_STATUS_NOT_FOUND);
                res.end();
            }
        }
        catch (e) {
            res.send(http2_1.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
            res.end(JSON.stringify(e.message));
        }
    }));
    express.post('/api/devices/:ieeeAddr/get', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
            if (device) {
                const state = yield platform.zigBeeClient.getState(device, req.body);
                res.status(http2_1.constants.HTTP_STATUS_OK);
                res.contentType('application/json');
                res.end(JSON.stringify({ state }));
            }
            else {
                res.status(http2_1.constants.HTTP_STATUS_NOT_FOUND);
                res.end();
            }
        }
        catch (e) {
            res.send(http2_1.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
            res.end(JSON.stringify(e.message));
        }
    }));
    express.post('/api/devices/:ieeeAddr/ping', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const ieeeAddr = req.params.ieeeAddr;
            const device = platform.zigBeeClient.getDevice(ieeeAddr);
            if (device) {
                yield platform.zigBeeClient.ping(ieeeAddr);
                res.status(http2_1.constants.HTTP_STATUS_OK);
                res.contentType('application/json');
                res.end(JSON.stringify({ device }));
            }
            else {
                res.status(http2_1.constants.HTTP_STATUS_NOT_FOUND);
                res.end();
            }
        }
        catch (e) {
            res.send(http2_1.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
            res.end(JSON.stringify(e.message));
        }
    }));
}
exports.mapDevicesRoutes = mapDevicesRoutes;
//# sourceMappingURL=devices.js.map