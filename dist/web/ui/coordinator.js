"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coordinator = void 0;
const evergreen_ui_1 = require("evergreen-ui");
const react_1 = __importDefault(require("react"));
const react_query_1 = require("react-query");
const coordinator_1 = require("./actions/coordinator");
const device_details_body_1 = require("./components/devices/device-details-body");
const error_1 = require("./components/error");
function Coordinator() {
    var _a;
    const queryResult = react_query_1.useQuery(['coordinator'], () => coordinator_1.CoordinatorService.fetch());
    if (queryResult.isError || ((_a = queryResult.data) === null || _a === void 0 ? void 0 : _a.error)) {
        return react_1.default.createElement(error_1.Error, { message: queryResult.data.error });
    }
    if (queryResult.isLoading) {
        return (react_1.default.createElement(evergreen_ui_1.Pane, { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
            react_1.default.createElement(evergreen_ui_1.Spinner, null)));
    }
    return (react_1.default.createElement(evergreen_ui_1.Pane, null,
        react_1.default.createElement(device_details_body_1.DeviceDetailsBody, { device: queryResult.data.coordinator, refresh: () => { } })));
}
exports.Coordinator = Coordinator;
//# sourceMappingURL=coordinator.js.map