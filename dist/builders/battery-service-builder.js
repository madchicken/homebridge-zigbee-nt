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
exports.BatteryServiceBuilder = exports.LOW_BATTERY_THRESHOLD = void 0;
const lodash_1 = require("lodash");
const service_builder_1 = require("./service-builder");
exports.LOW_BATTERY_THRESHOLD = 10;
class BatteryServiceBuilder extends service_builder_1.ServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform, accessory, client, state);
        this.service =
            this.accessory.getService(platform.Service.BatteryService) ||
                this.accessory.addService(platform.Service.BatteryService);
    }
    /**
     * Expose a service with battery percentage and notification when the battery level
     * goes under {@link LOW_BATTERY_THRESHOLD}
     */
    withBatteryPercentage() {
        const Characteristic = this.platform.Characteristic;
        this.service
            .getCharacteristic(Characteristic.BatteryLevel)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, lodash_1.get(this.state, 'battery', 0));
        }));
        this.service
            .getCharacteristic(Characteristic.StatusLowBattery)
            .on("get" /* GET */, (callback) => __awaiter(this, void 0, void 0, function* () {
            callback(null, this.state.battery && this.state.battery <= exports.LOW_BATTERY_THRESHOLD
                ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
        }));
        return this;
    }
}
exports.BatteryServiceBuilder = BatteryServiceBuilder;
//# sourceMappingURL=battery-service-builder.js.map