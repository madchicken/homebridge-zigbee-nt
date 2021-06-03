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
const React = __importStar(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const home_1 = require("./home");
const react_router_dom_1 = require("react-router-dom");
const coordinator_1 = require("./coordinator");
const devices_1 = require("./devices");
const react_query_1 = require("react-query");
const nav_bar_1 = require("./components/nav-bar");
const evergreen_ui_1 = require("evergreen-ui");
const constants_1 = require("./components/constants");
const queryClient = new react_query_1.QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false } },
});
function App() {
    return (React.createElement(evergreen_ui_1.Pane, { display: "flex", height: "100%" },
        React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
            React.createElement(react_router_dom_1.BrowserRouter, null,
                React.createElement(nav_bar_1.NavBar, null),
                React.createElement(evergreen_ui_1.Pane, { padding: constants_1.sizes.padding.large, flex: "1" },
                    React.createElement(react_router_dom_1.Switch, null,
                        React.createElement(react_router_dom_1.Route, { path: "/devices/:ieeAddr?" },
                            React.createElement(devices_1.Devices, null)),
                        React.createElement(react_router_dom_1.Route, { path: "/coordinator" },
                            React.createElement(coordinator_1.Coordinator, null)),
                        React.createElement(react_router_dom_1.Route, { path: "/" },
                            React.createElement(home_1.Home, null))))))));
}
react_dom_1.default.render(React.createElement(App, null), document.getElementById('react-app'));
//# sourceMappingURL=index.js.map