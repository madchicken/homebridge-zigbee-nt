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
exports.findSerialPort = void 0;
const serialport_1 = __importDefault(require("serialport"));
function findSerialPort() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ports = yield serialport_1.default.list();
            const port = ports.find(item => item.manufacturer === 'Texas Instruments');
            if (port) {
                return port.path;
            }
        }
        catch (e) {
            throw new Error(`Unable to get serial port list (${e})`);
        }
        throw new Error('Unable to find ZigBee port');
    });
}
exports.findSerialPort = findSerialPort;
//# sourceMappingURL=find-serial-port.js.map