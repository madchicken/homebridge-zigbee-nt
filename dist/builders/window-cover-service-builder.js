"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowCoverServiceBuilder = void 0;
const service_builder_1 = require("./service-builder");
const types_1 = require("../zigbee/types");
class WindowCoverServiceBuilder extends service_builder_1.ServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform, accessory, client, state);
        this.service =
            this.accessory.getService(platform.Service.WindowCovering) ||
                this.accessory.addService(platform.Service.WindowCovering);
        // create handlers for required characteristics
        this.service.getCharacteristic(this.Characteristic.CurrentPosition)
            .onGet(this.handleCurrentPositionGet.bind(this));
        this.service.getCharacteristic(this.Characteristic.PositionState)
            .onGet(this.handlePositionStateGet.bind(this));
        this.service.getCharacteristic(this.Characteristic.TargetPosition)
            .onGet(this.handleTargetPositionGet.bind(this))
            .onSet(this.handleTargetPositionSet.bind(this));
    }
    /**
     * Handle requests to get the current value of the "Current Position" characteristic
     */
    handleCurrentPositionGet() {
        return this.state.position;
    }
    /**
     * Handle requests to get the current value of the "Position State" characteristic
     */
    handlePositionStateGet() {
        return this.state.curtain_state === types_1.CurtainState.CLOSED
            ? this.Characteristic.PositionState.INCREASING
            : this.Characteristic.PositionState.DECREASING;
    }
    /**
     * Handle requests to get the current value of the "Target Position" characteristic
     */
    handleTargetPositionGet() {
        return this.state.position_target;
    }
    /**
     * Handle requests to set the "Target Position" characteristic
     */
    handleTargetPositionSet(value) {
        this.state.position = value;
        this.state.position_target = value;
    }
}
exports.WindowCoverServiceBuilder = WindowCoverServiceBuilder;
//# sourceMappingURL=window-cover-service-builder.js.map