"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Devices = void 0;
const react_1 = __importStar(require("react"));
const device_table_1 = __importDefault(require("./components/devices/device-table"));
const evergreen_ui_1 = require("evergreen-ui");
const device_details_1 = require("./components/devices/device-details");
const react_router_dom_1 = require("react-router-dom");
function Devices() {
    const location = react_router_dom_1.useLocation();
    const ieeeAddr = location.pathname.substr(location.pathname.lastIndexOf('/devices/') + '/devices/'.length);
    const detailsOpen = react_1.useMemo(() => !!ieeeAddr, [ieeeAddr]);
    return (react_1.default.createElement(evergreen_ui_1.Card, { display: "flex", alignItems: "stretch", justifyContent: "stretch", borderTop: true, borderRight: true, borderLeft: true, borderBottom: true, elevation: 2, height: "100%" },
        detailsOpen && react_1.default.createElement(device_details_1.DeviceDetails, { ieeeAddr: ieeeAddr }),
        react_1.default.createElement(device_table_1.default, null)));
}
exports.Devices = Devices;
//# sourceMappingURL=devices.js.map