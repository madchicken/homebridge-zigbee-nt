"use strict";
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
exports.CoordinatorService = void 0;
const utils_1 = require("./utils");
class CoordinatorService {
    static fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/api/coordinator`);
                if (response.ok) {
                    const json = yield response.json();
                    return {
                        result: 'success',
                        coordinator: json.coordinator,
                    };
                }
                else {
                    return utils_1.handleError(yield response.text());
                }
            }
            catch (e) {
                return utils_1.handleError(e.message);
            }
        });
    }
}
exports.CoordinatorService = CoordinatorService;
//# sourceMappingURL=coordinator.js.map