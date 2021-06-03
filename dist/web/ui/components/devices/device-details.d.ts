import { ReactElement } from 'react';
import { DeviceResponse } from '../../actions/devices';
interface Props {
    ieeeAddr: string;
}
export declare function useDevice(ieeeAddr: string): import("react-query").UseQueryResult<DeviceResponse, unknown>;
export declare function DeviceDetails(props: Props): ReactElement;
export {};
//# sourceMappingURL=device-details.d.ts.map