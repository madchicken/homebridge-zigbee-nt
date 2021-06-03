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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceStateManagement = void 0;
const react_1 = __importStar(require("react"));
const evergreen_ui_1 = require("evergreen-ui");
const devices_1 = require("../../actions/devices");
const constants_1 = require("../constants");
const react_json_view_1 = __importDefault(require("react-json-view"));
function DeviceStateManagement(props) {
    const { device } = props;
    const [state, setState] = react_1.useState({ isWorking: false, deviceState: '' });
    function onClickSet() {
        return __awaiter(this, void 0, void 0, function* () {
            setState(Object.assign(Object.assign({}, state), { isWorking: true, error: null }));
            let response = {};
            try {
                const newState = JSON.parse(state.deviceState);
                const res = yield devices_1.DevicesService.setDeviceState(device.ieeeAddr, newState);
                if (res.result === 'error') {
                    setState(Object.assign(Object.assign({}, state), { error: res.error }));
                }
                else {
                    response = res.state;
                }
            }
            catch (e) {
                setState(Object.assign(Object.assign({}, state), { error: e.message }));
            }
            finally {
                setState(Object.assign(Object.assign({}, state), { isWorking: false, stateResponse: response }));
            }
        });
    }
    function onClickGet() {
        return __awaiter(this, void 0, void 0, function* () {
            setState(Object.assign(Object.assign({}, state), { isWorking: true, error: null }));
            let response = {};
            try {
                const newState = JSON.parse(state.deviceState);
                const res = yield devices_1.DevicesService.getDeviceState(device.ieeeAddr, newState);
                console.log(res);
                if (res.result === 'error') {
                    setState(Object.assign(Object.assign({}, state), { error: res.error }));
                }
                else {
                    response = res.state;
                }
            }
            catch (e) {
                console.log(e);
                setState(Object.assign(Object.assign({}, state), { error: e.toString() }));
            }
            finally {
                setState(Object.assign(Object.assign({}, state), { isWorking: false, stateResponse: response }));
            }
        });
    }
    return (react_1.default.createElement(evergreen_ui_1.Pane, null,
        react_1.default.createElement(evergreen_ui_1.TextareaField, { label: "Get or Set custom state", placeholder: "Insert a valid json state here", value: state.deviceState, hint: state.error || 'test', required: true, onChange: e => setState(Object.assign(Object.assign({}, state), { deviceState: e.target.value })) }),
        react_1.default.createElement(evergreen_ui_1.Pane, { display: "flex", flexDirection: "row-reverse" },
            react_1.default.createElement(evergreen_ui_1.Button, { marginRight: constants_1.sizes.margin.medium, onClick: onClickSet, disabled: state.isWorking }, "Set"),
            react_1.default.createElement(evergreen_ui_1.Button, { marginRight: constants_1.sizes.margin.medium, onClick: onClickGet, disabled: state.isWorking }, "Get")),
        react_1.default.createElement(evergreen_ui_1.Pane, { height: "300px" },
            react_1.default.createElement(react_json_view_1.default, { src: state.stateResponse, onAdd: false, onDelete: false, onEdit: false }))));
}
exports.DeviceStateManagement = DeviceStateManagement;
//# sourceMappingURL=device-state-management.js.map