export type Endpoint = {
  ID: number;
  profileID: number;
  deviceID: number;
  inputClusters: number[];
  outputClusters: number[];
  deviceNetworkAddress: number;
  deviceIeeeAddress: string;
  clusters: {
    [k: string]: {
      attributes: any;
    };
  };
  _binds: any[];
  meta: any;
};

export type DeviceModel = {
  type: string;
  ieeeAddr: string;
  networkAddress: number;
  manufacturerID: string;
  manufacturerName: string;
  powerSource: string;
  modelID: string;
  interviewCompleted: boolean;
  lastSeen: number;
  softwareBuildID: string;
  linkquality: number;
  endpoints?: Endpoint[];
};

export interface CoordinatorModel extends DeviceModel {
  meta: { [s: string]: number | string };
}
