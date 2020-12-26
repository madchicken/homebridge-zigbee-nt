import { Express } from 'express';
import { constants } from 'http2';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ZigbeeNTHomebridgePlatform } from '../../platform';

export function mapCoordinatorRoutes(express: Express, platform: ZigbeeNTHomebridgePlatform) {
  express.get('/api/coordinator', (_req, res) => {
    const coordinator: Device = platform.zigBeeClient.getCoodinator();
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ coordinator }));
  });
}
