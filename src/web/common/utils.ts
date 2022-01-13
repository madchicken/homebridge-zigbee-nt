import { DeviceModel, Endpoint } from './types';
import { CustomDeviceSetting } from '../../types';

function normalizeEndpoint(e): Endpoint {
  return {
    ID: e.ID,
    profileID: e.profileID,
    deviceID: e.deviceID,
    inputClusters: e.inputClusters,
    outputClusters: e.outputClusters,
    deviceNetworkAddress: e.deviceNetworkAddress,
    deviceIeeeAddress: e.deviceIeeeAddress,
    clusters: e.clusters,
    bindings: e._binds,
    configuredReportingList: e._configuredReportings,
    meta: e.meta,
  };
}

export function normalizeDeviceModel(d: any, customDeviceSettings: CustomDeviceSetting[]): DeviceModel {
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
    settings: customDeviceSettings?.find(s => s.ieeeAddr === d._ieeeAddr) || {
      ieeeAddr: d._ieeeAddr
    }
  };
}
