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
exports.mapCoordinatorRoutes = void 0;
const http2_1 = require("http2");
const utils_1 = require("../common/utils");
function mapCoordinatorRoutes(express, platform) {
    express.get('/api/coordinator', (_req, res) => __awaiter(this, void 0, void 0, function* () {
        const version = yield platform.zigBeeClient.getCoordinatorVersion();
        const coordinator = Object.assign(Object.assign({}, version), utils_1.normalizeDeviceModel(platform.zigBeeClient.getCoordinator()));
        res.status(http2_1.constants.HTTP_STATUS_OK);
        res.contentType('application/json');
        res.end(JSON.stringify({ coordinator }));
    }));
}
exports.mapCoordinatorRoutes = mapCoordinatorRoutes;
//# sourceMappingURL=coordinator.js.map