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
exports.DeviceDetails = exports.useDevice = void 0;
const evergreen_ui_1 = require("evergreen-ui");
const react_1 = __importStar(require("react"));
const devices_1 = require("../../actions/devices");
const react_query_1 = require("react-query");
const error_1 = require("../error");
const react_router_dom_1 = require("react-router-dom");
const device_details_body_1 = require("./device-details-body");
const device_table_1 = require("./device-table");
const constants_1 = require("../constants");
function renderConfirmDialog(selectedDevice, state, setState, history) {
    const queryClient = react_query_1.useQueryClient();
    return (react_1.default.createElement(evergreen_ui_1.Dialog, { isShown: state.isDeleteConfirmationShown, title: "Unpair confirmation", onConfirm: () => __awaiter(this, void 0, void 0, function* () {
            setState(Object.assign(Object.assign({}, state), { isDeletingDevice: true }));
            const response = yield devices_1.DevicesService.deleteDevice(selectedDevice.ieeeAddr);
            if (response.result === 'success') {
                setState(Object.assign(Object.assign({}, state), { isDialogShown: false, isDeletingDevice: false }));
                yield queryClient.invalidateQueries(device_table_1.DEVICES_QUERY_KEY);
                history.push('/devices');
            }
        }), isConfirmLoading: state.isDeletingDevice, onCancel: () => setState(Object.assign(Object.assign({}, state), { isDeleteConfirmationShown: false })), cancelLabel: "Cancel", confirmLabel: state.isDeletingDevice ? 'Unpairing...' : 'Unpair' }, selectedDevice && (react_1.default.createElement(evergreen_ui_1.Paragraph, { size: 300 },
        "Are you sure you want to unpair device ",
        selectedDevice.modelID,
        " (",
        selectedDevice.ieeeAddr,
        ")?"))));
}
function renderSpinner() {
    return (react_1.default.createElement(evergreen_ui_1.Pane, { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
        react_1.default.createElement(evergreen_ui_1.Spinner, null)));
}
function useDevice(ieeeAddr) {
    return react_query_1.useQuery(['device', ieeeAddr], () => devices_1.DevicesService.fetchDevice(ieeeAddr));
}
exports.useDevice = useDevice;
function DeviceDetails(props) {
    const history = react_router_dom_1.useHistory();
    const queryResult = useDevice(props.ieeeAddr);
    const [state, setState] = react_1.useState({
        selectedTab: 'Info',
        isDeleteConfirmationShown: false,
    });
    if (queryResult) {
        if (queryResult.isError) {
            return react_1.default.createElement(error_1.Error, { message: queryResult.error });
        }
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(evergreen_ui_1.SideSheet, { isShown: true, onCloseComplete: () => history.push('/devices'), containerProps: {
                    display: 'flex',
                    flex: '1',
                    flexDirection: 'column',
                } },
                react_1.default.createElement(evergreen_ui_1.Pane, { display: "flex", padding: constants_1.sizes.padding.small, background: "tint2", borderRadius: 3, width: "100%", height: `${constants_1.sizes.header.small}px`, flexDirection: "row-reverse" },
                    queryResult.isLoading
                        ? null
                        : renderConfirmDialog(queryResult.data.device, state, setState, history),
                    react_1.default.createElement(evergreen_ui_1.IconButton, { icon: evergreen_ui_1.TrashIcon, marginRight: constants_1.sizes.margin.medium, intent: "danger", onClick: () => setState(Object.assign(Object.assign({}, state), { isDeleteConfirmationShown: true })), disabled: queryResult.isLoading || queryResult.isError })),
                react_1.default.createElement(evergreen_ui_1.Pane, { zIndex: 1, flexShrink: 0, elevation: 0, backgroundColor: "white", height: `calc(100% - ${constants_1.sizes.header.small}px)` }, queryResult.isLoading ? (renderSpinner()) : (react_1.default.createElement(device_details_body_1.DeviceDetailsBody, { device: queryResult.data.device, refresh: () => __awaiter(this, void 0, void 0, function* () {
                        yield queryResult.refetch();
                    }) }))))));
    }
    return null;
}
exports.DeviceDetails = DeviceDetails;
//# sourceMappingURL=device-details.js.map