"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionType = exports.CurtainState = void 0;
var CurtainState;
(function (CurtainState) {
    CurtainState["CLOSED"] = "closed";
    CurtainState["OPENED"] = "opened";
})(CurtainState = exports.CurtainState || (exports.CurtainState = {}));
var ActionType;
(function (ActionType) {
    ActionType["set"] = "set";
    ActionType["get"] = "get";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
var AccessType;
(function (AccessType) {
    AccessType[AccessType["STATE"] = 1] = "STATE";
    AccessType[AccessType["SET"] = 2] = "SET";
    AccessType[AccessType["STATE_SET"] = 3] = "STATE_SET";
    AccessType[AccessType["STATE_GET"] = 5] = "STATE_GET";
    AccessType[AccessType["ALL"] = 7] = "ALL";
})(AccessType || (AccessType = {}));
//# sourceMappingURL=types.js.map