"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgrammableSwitchServiceBuilder = void 0;
class ProgrammableSwitchServiceBuilder {
    constructor(platform, accessory, client, state) {
        this.platform = platform;
        this.accessory = accessory;
        this.client = client;
        this.state = state;
        this.services = [];
    }
    withStatelessSwitch(displayName, subType, index, supportedActions) {
        const service = this.accessory.getServiceById(this.platform.Service.StatelessProgrammableSwitch, subType) ||
            this.accessory.addService(this.platform.Service.StatelessProgrammableSwitch, displayName, subType);
        service.setCharacteristic(this.platform.Characteristic.Name, displayName);
        service.setCharacteristic(this.platform.Characteristic.ServiceLabelIndex, index);
        if (supportedActions && supportedActions.length) {
            service.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent).setProps({
                validValues: supportedActions,
            });
        }
        this.services.push(service);
        return this;
    }
    build() {
        return this.services;
    }
}
exports.ProgrammableSwitchServiceBuilder = ProgrammableSwitchServiceBuilder;
//# sourceMappingURL=programmable-switch-service-builder.js.map