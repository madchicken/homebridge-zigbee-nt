"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Error = void 0;
const react_1 = __importDefault(require("react"));
const evergreen_ui_1 = require("evergreen-ui");
function renderError(error, description) {
    return (react_1.default.createElement(evergreen_ui_1.Pane, { height: 120, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
        react_1.default.createElement(evergreen_ui_1.Alert, { intent: "danger", title: error }, description || null)));
}
function Error(props) {
    return renderError(props.message, props.description);
}
exports.Error = Error;
//# sourceMappingURL=error.js.map