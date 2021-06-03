"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseModelName = void 0;
function parseModelName(model) {
    // Remove non-ascii symbols
    return !model
        ? model
        : model
            .replace(/[^ -~]+/g, '')
            .replace(/[^\x00-\x7F]/g, '') // eslint-disable-line no-control-regex
            .trim();
}
exports.parseModelName = parseModelName;
//# sourceMappingURL=parse-model-name.js.map