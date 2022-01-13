import { Express } from 'express';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import winston from 'winston';
import { constants } from 'http2';
import { GroupModel } from '../common/types';
import { BaseResponse } from '../ui/actions/devices';
import { Group } from 'zigbee-herdsman/dist/controller/model';

interface GroupResponse extends BaseResponse {
  groups?: GroupModel[]
}

export function mapGroupsRoutes(
  express: Express,
  platform: ZigbeeNTHomebridgePlatform,
  logger: winston.Logger
) {
  express.get<string, any, GroupResponse, any>('/api/groups', (_req, res) => {
    const groups: Group[] = platform.zigBeeClient.getGroups();
    logger.debug('Returning groups: ', groups);
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ groups: groups.map(group => ({ ID: group.groupID, name: group.meta?.friendlyName })) }));
  });
}