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
exports.DeviceDetailsBody = void 0;
const react_1 = __importStar(require("react"));
const evergreen_ui_1 = require("evergreen-ui");
const react_json_view_1 = __importDefault(require("react-json-view"));
const device_state_management_1 = require("./device-state-management");
const constants_1 = require("../constants");
const dayjs_1 = __importDefault(require("dayjs"));
const relativeTime_1 = __importDefault(require("dayjs/plugin/relativeTime"));
dayjs_1.default.extend(relativeTime_1.default);
const TABS = ['Info', 'Structure', 'State'];
const COORDINATOR_TABS = ['Info', 'Structure'];
function isCoordinator(device) {
    return device.type === 'Coordinator';
}
function renderInfo(device) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.small },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: 400 },
                "Manufacturer: ",
                device.manufacturerName)),
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.small },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: 400 },
                "Manufacturer ID: ",
                device.manufacturerID)),
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.small },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: 400 },
                "IEEE Address: ",
                device.ieeeAddr)),
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.small },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: 400 },
                "Software build: ",
                device.softwareBuildID)),
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.small },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: 400 },
                "Link quality: ",
                device.linkquality)),
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.small },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: 400 },
                "Last seen: ",
                dayjs_1.default(device.lastSeen).fromNow(false)))));
}
function renderCoordinatorInfo(device) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.small },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: 400 },
                "IEEE Address: ",
                device.ieeeAddr)),
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.small },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: 400 },
                "Version: ",
                device.meta.majorrel,
                ".",
                device.meta.minorrel,
                " (rev. ",
                device.meta.revision,
                ")")),
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.small },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: 400 },
                "Transport Version: ",
                device.meta.maintrel,
                " (rev. ",
                device.meta.transportrev,
                ")"))));
}
function renderDeviceStructure(device) {
    return (react_1.default.createElement(react_json_view_1.default, { src: device, onAdd: false, onDelete: false, onEdit: false, enableClipboard: true }));
}
function renderCustomState(device) {
    return react_1.default.createElement(device_state_management_1.DeviceStateManagement, { device: device });
}
function renderSelectedTab(selectedTab, device) {
    let content = null;
    switch (selectedTab) {
        case 'Info':
            content = isCoordinator(device)
                ? renderCoordinatorInfo(device)
                : renderInfo(device);
            break;
        case 'Structure':
            content = renderDeviceStructure(device);
            break;
        case 'State':
            content = renderCustomState(device);
            break;
    }
    return (react_1.default.createElement(evergreen_ui_1.Card, { backgroundColor: "white", elevation: 2, display: "flex", flexDirection: "column", padding: constants_1.sizes.padding.small, height: "100%" }, content));
}
function DeviceDetailsBody(props) {
    const { device } = props;
    const [state, setState] = react_1.useState({ selectedTab: TABS[0], isLoadingState: false });
    return (react_1.default.createElement(evergreen_ui_1.Pane, { height: "100%" },
        react_1.default.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.large, borderBottom: "muted", height: `${constants_1.sizes.header.medium}px` },
            react_1.default.createElement(evergreen_ui_1.Heading, { size: 600 },
                device.manufacturerName,
                " ",
                device.modelID),
            react_1.default.createElement(evergreen_ui_1.Paragraph, { size: 400, color: "muted" },
                "Type: ",
                device.type)),
        react_1.default.createElement(evergreen_ui_1.Pane, { display: "flex", padding: constants_1.sizes.padding.large, flexDirection: "column", height: `calc(100% - ${constants_1.sizes.header.medium}px)` },
            react_1.default.createElement(evergreen_ui_1.TabNavigation, { marginBottom: constants_1.sizes.margin.medium }, (isCoordinator(device) ? COORDINATOR_TABS : TABS).map(tab => (react_1.default.createElement(evergreen_ui_1.Tab, { key: tab, isSelected: state.selectedTab === tab, onSelect: () => setState(Object.assign(Object.assign({}, state), { selectedTab: tab })) }, tab)))),
            renderSelectedTab(state.selectedTab, device))));
}
exports.DeviceDetailsBody = DeviceDetailsBody;
//# sourceMappingURL=device-details-body.js.map