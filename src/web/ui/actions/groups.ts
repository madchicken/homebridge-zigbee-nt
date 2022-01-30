import { BaseResponse } from './devices';
import { GroupModel } from '../../common/types';

export interface GroupResponse extends BaseResponse {
  groups?: GroupModel[];
}

export class GroupsServices {
  static async fetchAll(): Promise<GroupResponse> {
    const response = await fetch('/api/groups');
    if (response.ok) {
      const json = await response.json();
      return {
        result: 'success',
        groups: json.groups,
      };
    } else {
      throw new Error(await response.text());
    }
  }
}