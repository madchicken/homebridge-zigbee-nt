import { Express } from 'express';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { constants } from 'http2';
import { Device } from 'zigbee-herdsman/dist/controller/model';

export function mapCoordinatorRoutes(express: Express, zigBee: ZigBeeClient) {
  express.get('/coordinator', (req, res) => {
    const coordinator: Device = zigBee.getCoodinator();
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ coordinator }));
  });
}
