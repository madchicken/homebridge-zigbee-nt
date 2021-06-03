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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavBar = void 0;
const evergreen_ui_1 = require("evergreen-ui");
const React = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const constants_1 = require("./constants");
var Page;
(function (Page) {
    Page["HOME"] = "home";
    Page["DEVICES"] = "devices";
    Page["COORDINATOR"] = "coordinator";
})(Page || (Page = {}));
const CONFIGURED_PAGES = [
    {
        label: Page.HOME,
        value: Page.HOME,
    },
    {
        label: Page.DEVICES,
        value: Page.DEVICES,
    },
    {
        label: Page.COORDINATOR,
        value: Page.COORDINATOR,
    },
];
function NavBar() {
    const history = react_router_dom_1.useHistory();
    const location = react_router_dom_1.useLocation();
    return (React.createElement(evergreen_ui_1.Tablist, { marginBottom: constants_1.sizes.margin.large, marginRight: constants_1.sizes.margin.large, flexBasis: 240 }, CONFIGURED_PAGES.map(tab => (React.createElement(evergreen_ui_1.SidebarTab, { key: tab.label, id: tab.value, onSelect: () => history.push(`${tab.value}`), isSelected: location.pathname.includes(tab.value), "aria-controls": `panel-${tab.value}` }, tab.label)))));
}
exports.NavBar = NavBar;
//# sourceMappingURL=nav-bar.js.map