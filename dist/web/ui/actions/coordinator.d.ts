import { BaseResponse } from './devices';
import { DeviceModel } from '../../common/types';
export interface CoordinatorResponse extends BaseResponse {
    coordinator?: DeviceModel;
}
export declare class CoordinatorService {
    static fetch(): Promise<CoordinatorResponse>;
}
//# sourceMappingURL=coordinator.d.ts.map