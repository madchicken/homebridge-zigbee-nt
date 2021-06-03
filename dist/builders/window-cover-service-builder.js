"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowCoverServiceBuilder = void 0;
const service_builder_1 = require("./service-builder");
const types_1 = require("../zigbee/types");
class WindowCoverServiceBuilder extends service_builder_1.ServiceBuilder {
    constructor(platform, accessory, client, state) {
        super(platform, accessory, client, state);
        this.logger = platform.log;
        this.service =
            this.accessory.getService(platform.Service.WindowCovering) ||
                this.accessory.addService(platform.Service.WindowCovering);

        this.logger.info(`[WindowCoverServiceBuilder] service characteristics: ${JSON.stringify(this.service.characteristics)}`);

        this.service.
        on("characteristic-change", (change, ...args) => {
            platform.log.info(`[WindowCoverServiceBuilder] on characteristic-change - change: ${JSON.stringify(change)}`);
            platform.log.info(`[WindowCoverServiceBuilder] on characteristic-change - args: ${JSON.stringify(args)}`);
        })
        on("service-configurationChange", (...args) => {
            platform.log.info(`[WindowCoverServiceBuilder] on characteristic-change -args: ${JSON.stringify(args)}`);
        })
        on("characteristic-warning", (warning,...args) => {
            platform.log.info(`[WindowCoverServiceBuilder] on characteristic-change- warning: ${JSON.stringify(warning)}`);
            platform.log.info(`[WindowCoverServiceBuilder] on characteristic-change - args: ${JSON.stringify(args)}`);
        })

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
        this.logger.info(`[WindowCoverServiceBuilder] handleCurrentPositionGet - state: ${JSON.stringify(this.state)}`)
        return this.state.position;
    }
    /**
     * Handle requests to get the current value of the "Position State" characteristic
     */
    handlePositionStateGet() {
        this.logger.info(`[WindowCoverServiceBuilder] handlePositionStateGet - state: ${JSON.stringify(this.state)}`)
        if (this.state.running) return this.Characteristic.PositionState.STOPPED;

        return this.state.state === types_1.CurtainState.CLOSED
            ? this.Characteristic.PositionState.INCREASING
            : this.Characteristic.PositionState.DECREASING;
    }
    /**
     * Handle requests to get the current value of the "Target Position" characteristic
     */
    handleTargetPositionGet() {
        this.logger.info(`[WindowCoverServiceBuilder] handleTargetPositionGet - state: ${JSON.stringify(this.state)}`)
        return this.state.position;
    }
    /**
     * Handle requests to set the "Target Position" characteristic
     */
    handleTargetPositionSet(value) {
        this.logger.info(`[WindowCoverServiceBuilder] handleTargetPositionSet - value: ${value}`)
        this.state.position = value;
        if (this.state.position === 0) {
            this.state.state = types_1.CurtainState.OPENED;
        } else {
            this.state.state = types_1.CurtainState.CLOSED;
        }

        this.client.setCustomState(this.device, {position: value});
        // this.state.position_target = value;
    }
}
exports.WindowCoverServiceBuilder = WindowCoverServiceBuilder;
//# sourceMappingURL=window-cover-service-builder.js.map