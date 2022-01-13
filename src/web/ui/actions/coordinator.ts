import { BaseResponse } from './devices';
import { handleError } from './utils';
import { CoordinatorModel } from '../../common/types';

export interface CoordinatorResponse extends BaseResponse {
  coordinator?: CoordinatorModel;
}

type PermitJoinResponse = { permitJoin: boolean };
type TouchLinkResponse = { touchLink: boolean };

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

  static async startPermitJoin(): Promise<PermitJoinResponse> {
    const response = await fetch(`/api/coordinator/permitJoin`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (response.ok) {
      const json = await response.json();
      return json as PermitJoinResponse;
    } else {
      throw new Error(await response.text());
    }
  }

  static async stopPermitJoin(): Promise<PermitJoinResponse> {
    const response = await fetch(`/api/coordinator/permitJoin`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (response.ok) {
      const json = await response.json();
      return json as PermitJoinResponse;
    } else {
      throw new Error(await response.text());
    }
  }

  static async startTouchLink(): Promise<TouchLinkResponse> {
    const response = await fetch(`/api/coordinator/touchLink`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (response.ok) {
      const json = await response.json();
      return json as TouchLinkResponse;
    } else {
      throw new Error(await response.text());
    }
  }

}
