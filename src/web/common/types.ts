import { CustomDeviceSetting } from '../../types';

export interface Binding {
  cluster: number;
  type: 'group' | 'endpoint';
  groupID?: number;
  endpointID?: number;
  deviceIeeeAddress?: string;
}

export interface ConfiguredReporting {
  cluster: number;
  attrId: number;
  minRepIntval: number;
  maxRepIntval: number;
  repChange: number;
}

export type ClusterName = 'closuresWindowCovering' | "genLevelCtrl" | 'lightingColorCtrl' | 'genOnOff' | 'genScenes';

export type Endpoint = {
  ID: number;
  profileID: number;
  deviceID: number;
  inputClusters: number[];
  outputClusters: number[];
  deviceNetworkAddress: number;
  deviceIeeeAddress: string;
  clusters: Record<ClusterName, any>;
  bindings: Binding[];
  configuredReportingList: ConfiguredReporting[];
  meta: any;
};

export type IEEEAddress = string;
export type GroupName = string;

export type DeviceModel = {
  type: string;
  ieeeAddr: IEEEAddress;
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
  otaAvailable?: boolean;
  newFirmwareAvailable?: string;
  settings: CustomDeviceSetting
};

export interface CoordinatorModel extends DeviceModel {
  meta: { [s: string]: number | string };
}
