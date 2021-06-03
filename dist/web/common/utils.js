"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDeviceModel = void 0;
function normalizeEndpoint(e) {
    return {
        ID: e.ID,
        profileID: e.profileID,
        deviceID: e.deviceID,
        inputClusters: e.inputClusters,
        outputClusters: e.outputClusters,
        deviceNetworkAddress: e.deviceNetworkAddress,
        deviceIeeeAddress: e.deviceIeeeAddress,
        clusters: e.clusters,
        binds: e._binds,
        configuredReportings: e._configuredReportings,
        meta: e.meta,
    };
}
function normalizeDeviceModel(d) {
    return {
        type: d._type,
        ieeeAddr: d._ieeeAddr,
        networkAddress: d._networkAddress,
        manufacturerID: d._manufacturerID,
        manufacturerName: d._manufacturerName,
        powerSource: d._powerSource,
        modelID: d._modelID,
        interviewCompleted: d._interviewCompleted,
        softwareBuildID: d._softwareBuildID,
        lastSeen: d._lastSeen,
        endpoints: d._endpoints.map(e => normalizeEndpoint(e)),
        linkquality: d._linkquality,
    };
}
exports.normalizeDeviceModel = normalizeDeviceModel;
//# sourceMappingURL=utils.js.map