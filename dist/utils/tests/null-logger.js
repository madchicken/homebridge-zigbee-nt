"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
exports.log = (() => {
    const l = (_message, ..._parameters) => { };
    return Object.assign(l, {
        prefix: 'none',
        info: function (_message, ..._parameters) { },
        warn: function (_message, ..._parameters) { },
        error: function (_message, ..._parameters) { },
        debug: function (_message, ..._parameters) { },
        log: function (_level, _message, ..._parameters) { },
    });
})();
//# sourceMappingURL=null-logger.js.map