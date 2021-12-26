import { Express } from 'express';
import { constants } from 'http2';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { ClusterName, GroupName, IEEEAddress } from '../common/types';

interface BindUnbindRequest {
  from: IEEEAddress | GroupName;
  to: IEEEAddress | GroupName;
  sourceEndpoint?: number;
  targetEndpoint?: number;
  clusters?: ClusterName[];
  skip_disable_reporting?: boolean;
}

interface BindUnbindResponse {
  data: {
    from: IEEEAddress | GroupName;
    to: IEEEAddress | GroupName;
    clusters?: ClusterName[];
    failed?: ClusterName[];
  },
  status: 'ok' | 'error';
}

export function mapBindRoutes(express: Express, platform: ZigbeeNTHomebridgePlatform): void {
  express.post('/api/bind', async (req, res) => {
    const bindRequest = req.body as BindUnbindRequest;
    const bindingResult = await platform.zigBeeClient.bind(bindRequest.from, bindRequest.to, bindRequest.clusters, bindRequest.sourceEndpoint, bindRequest.targetEndpoint);
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    const result: BindUnbindResponse = {
      data: {
        from: bindRequest.from,
        to: bindRequest.to,
        clusters: bindingResult.successfulClusters,
        failed: bindingResult.failedClusters
      },
      status: 'ok'
    }
    res.end(JSON.stringify(result));
  });

  express.post('/api/unbind', async (req, res) => {
    const bindRequest = req.body as BindUnbindRequest;
    const bindingResult = await platform.zigBeeClient.unbind(bindRequest.from, bindRequest.to, bindRequest.clusters, bindRequest.sourceEndpoint, bindRequest.targetEndpoint);
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    const result: BindUnbindResponse = {
      data: {
        from: bindRequest.from,
        to: bindRequest.to,
        clusters: bindingResult.successfulClusters,
        failed: bindingResult.failedClusters
      },
      status: 'ok'
    }
    res.end(JSON.stringify(result));
  });
}
