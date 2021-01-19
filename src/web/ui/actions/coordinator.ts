import { BaseResponse } from './devices';
import { handleError } from './utils';
import { DeviceModel } from '../../common/types';

export interface CoordinatorResponse extends BaseResponse {
  coordinator?: DeviceModel;
}

export class CoordinatorService {
  static async fetch(): Promise<CoordinatorResponse> {
    try {
      const response = await fetch(`/api/coordinator`);
      if (response.ok) {
        const json = await response.json();
        return {
          result: 'success',
          coordinator: json.coordinator,
        };
      } else {
        return handleError(await response.text());
      }
    } catch (e) {
      return handleError(e.message);
    }
  }
}
