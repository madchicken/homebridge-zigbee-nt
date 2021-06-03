"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEVICES_QUERY_KEY = void 0;
const react_1 = __importDefault(require("react"));
const evergreen_ui_1 = require("evergreen-ui");
const react_query_1 = require("react-query");
const devices_1 = require("../../actions/devices");
const error_1 = require("../error");
const react_router_dom_1 = require("react-router-dom");
const dayjs_1 = __importDefault(require("dayjs"));
const constants_1 = require("../constants");
function renderTable(devices, history) {
    return (react_1.default.createElement(react_1.default.Fragment, null, devices.map((device, index) => {
        const qualityPercent = Math.round(device.linkquality ? (device.linkquality / 255) * 100 : 0);
        let color = 'green';
        if (qualityPercent < 4) {
            color = 'red';
        }
        else if (qualityPercent < 20) {
            color = 'orange';
        }
        else if (qualityPercent < 50) {
            color = 'yellow';
        }
        return (react_1.default.createElement(evergreen_ui_1.Table.Row, { key: index, isSelectable: true, onSelect: () => history.push(`/devices/${device.ieeeAddr}`) },
            react_1.default.createElement(evergreen_ui_1.Table.TextCell, null, device.modelID),
            react_1.default.createElement(evergreen_ui_1.Table.TextCell, null, device.manufacturerName),
            react_1.default.createElement(evergreen_ui_1.Table.TextCell, null, device.ieeeAddr),
            react_1.default.createElement(evergreen_ui_1.Table.TextCell, null, device.powerSource),
            react_1.default.createElement(evergreen_ui_1.Table.TextCell, null,
                react_1.default.createElement(evergreen_ui_1.Pill, { color: color }, qualityPercent ? `${qualityPercent} %` : 'disconnected')),
            react_1.default.createElement(evergreen_ui_1.Table.TextCell, null, dayjs_1.default(device.lastSeen).format('MMMM D, YYYY h:mm:ss A'))));
    })));
}
function renderSpinner() {
    return (react_1.default.createElement(evergreen_ui_1.Pane, { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
        react_1.default.createElement(evergreen_ui_1.Spinner, null)));
}
exports.DEVICES_QUERY_KEY = 'devices';
function DeviceTable() {
    const res = react_query_1.useQuery(exports.DEVICES_QUERY_KEY, devices_1.DevicesService.fetchDevices);
    const { isLoading, isError, data } = res;
    const error = res.error;
    const history = react_router_dom_1.useHistory();
    const size = 600;
    return (react_1.default.createElement(evergreen_ui_1.Pane, { display: "flex", flexDirection: "column", justifyContent: "stretch", width: "100%", height: "100%" },
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.large, borderBottom: "muted", height: `${constants_1.sizes.header.medium}px` },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: size }, "Paired devices")),
        react_1.default.createElement(evergreen_ui_1.Table, { height: `calc(100% - ${constants_1.sizes.header.medium}px)` },
            react_1.default.createElement(evergreen_ui_1.Table.Head, null,
                react_1.default.createElement(evergreen_ui_1.Table.TextHeaderCell, null, "Model ID"),
                react_1.default.createElement(evergreen_ui_1.Table.TextHeaderCell, null, "Manufacturer"),
                react_1.default.createElement(evergreen_ui_1.Table.TextHeaderCell, null, "IEEE Address"),
                react_1.default.createElement(evergreen_ui_1.Table.TextHeaderCell, null, "Power source"),
                react_1.default.createElement(evergreen_ui_1.Table.TextHeaderCell, null, "Link Quality"),
                react_1.default.createElement(evergreen_ui_1.Table.TextHeaderCell, null, "Last seen")),
            react_1.default.createElement(evergreen_ui_1.Table.Body, { height: "100%" }, isError ? (react_1.default.createElement(error_1.Error, { message: error.message })) : isLoading ? (renderSpinner()) : (renderTable((data === null || data === void 0 ? void 0 : data.devices) || [], history))))));
}
exports.default = DeviceTable;
//# sourceMappingURL=device-table.js.map