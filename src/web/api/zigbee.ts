import { Express } from 'express';
import { constants } from 'http2';
import { ZigbeeNTHomebridgePlatform } from '../../platform';

export function mapZigBeeRoutes(express: Express, platform: ZigbeeNTHomebridgePlatform) {
  express.get('/api/permitJoin', async (_req, res) => {
    const status = await platform.zigBeeClient.getPermitJoin();
    await platform.zigBeeClient.permitJoin(!status);
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ permitJoin: status }));
  });

  express.post('/api/permitJoin', async (req, res) => {
    const permitJoin = req.body.permitJoin;
    const status = await platform.zigBeeClient.getPermitJoin();
    if (permitJoin !== status) {
      await platform.zigBeeClient.permitJoin(permitJoin);
      res.status(constants.HTTP_STATUS_OK);
      res.contentType('application/json');
    }
    res.end(JSON.stringify({ permitJoin }));
  });
}
