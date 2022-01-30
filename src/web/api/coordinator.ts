import { Express } from 'express';
import { constants } from 'http2';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { normalizeDeviceModel } from '../common/utils';
import { CoordinatorModel } from '../common/types';

export function mapCoordinatorRoutes(express: Express, platform: ZigbeeNTHomebridgePlatform) {
  express.get('/api/coordinator', async (_req, res) => {
    const version = await platform.zigBeeClient.getCoordinatorVersion();
    const permitJoin = await platform.zigBeeClient.getPermitJoin();
    const normalizedCoordinator = normalizeDeviceModel(platform.zigBeeClient.getCoordinator(), platform.config.customDeviceSettings);
    const coordinator: CoordinatorModel = {
      ...version,
      ...normalizedCoordinator,
      permitJoin,
      settings: {
        ieeeAddr: normalizedCoordinator.ieeeAddr,
        friendlyName: 'Coordinator'
      }
    };
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ coordinator }));
  });

  express.get('/api/coordinator/permitJoin', async (_req, res) => {
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ permitJoin: await platform.zigBeeClient.getPermitJoin() }));
  });

  express.post('/api/coordinator/permitJoin', async (_req, res) => {
    await platform.zigBeeClient.permitJoin(true);
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ permitJoin: true }));
  });

  express.delete('/api/coordinator/permitJoin', async (_req, res) => {
    await platform.zigBeeClient.permitJoin(false);
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ permitJoin: false }));
  });

  express.post('/api/coordinator/touchLink', async (_req, res) => {
    const result = await platform.zigBeeClient.touchlinkFactoryReset();
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ touchLink: result }));
  });
}
