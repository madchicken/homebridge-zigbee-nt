import { DeviceModel } from './types';

export function normalizeDeviceModel(d): DeviceModel {
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
    endpoints: d._endpoints,
    linkquality: d._linkquality,
  };
}
