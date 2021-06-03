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
exports.mapZigBeeRoutes = void 0;
const http2_1 = require("http2");
function mapZigBeeRoutes(express, platform) {
    express.get('/api/permitJoin', (_req, res) => __awaiter(this, void 0, void 0, function* () {
        const status = yield platform.zigBeeClient.getPermitJoin();
        yield platform.zigBeeClient.permitJoin(!status);
        res.status(http2_1.constants.HTTP_STATUS_OK);
        res.contentType('application/json');
        res.end(JSON.stringify({ permitJoin: status }));
    }));
    express.post('/api/permitJoin', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const permitJoin = req.body.permitJoin;
        const status = yield platform.zigBeeClient.getPermitJoin();
        if (permitJoin !== status) {
            yield platform.zigBeeClient.permitJoin(permitJoin);
            res.status(http2_1.constants.HTTP_STATUS_OK);
            res.contentType('application/json');
        }
        res.end(JSON.stringify({ permitJoin }));
    }));
}
exports.mapZigBeeRoutes = mapZigBeeRoutes;
//# sourceMappingURL=zigbee.js.map