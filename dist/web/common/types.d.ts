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
export declare type Endpoint = {
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
    binds: Binding[];
    configuredReportings: ConfiguredReporting[];
    meta: any;
};
export declare type DeviceModel = {
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
    otaAvailable?: boolean;
    newFirmwareAvailable?: string;
};
export interface CoordinatorModel extends DeviceModel {
    meta: {
        [s: string]: number | string;
    };
}
//# sourceMappingURL=types.d.ts.map