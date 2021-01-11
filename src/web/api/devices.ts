import { Express } from 'express';
import { constants } from 'http2';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { normalizeDeviceModel } from '../common/utils';

export function mapDevicesRoutes(express: Express, platform: ZigbeeNTHomebridgePlatform) {
  express.get('/api/devices', (_req, res) => {
    const devices: Device[] = platform.zigBeeClient.getAllPairedDevices();
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ devices: devices.map(device => normalizeDeviceModel(device)) }));
  });

  express.get('/api/devices/:ieeeAddr', (req, res) => {
    const device: Device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ device: normalizeDeviceModel(device) }));
  });

  express.delete('/api/devices/:ieeeAddr', async (req, res) => {
    const device: Device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
    if (device) {
      await platform.unpairDevice(req.params.ieeeAddr);
      res.status(constants.HTTP_STATUS_OK);
      res.contentType('application/json');
      res.end(JSON.stringify({ device: normalizeDeviceModel(device) }));
    } else {
      res.status(constants.HTTP_STATUS_NOT_FOUND);
      res.end();
    }
  });

  express.post('/api/devices/:ieeeAddr/set', async (req, res) => {
    try {
      const device: Device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
      if (device) {
        const state = await platform.zigBeeClient.setCustomState(device, req.body);
        res.status(constants.HTTP_STATUS_OK);
        res.contentType('application/json');
        res.end(JSON.stringify({ state }));
      } else {
        res.status(constants.HTTP_STATUS_NOT_FOUND);
        res.end();
      }
    } catch (e) {
      res.send(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      res.end(JSON.stringify(e.message));
    }
  });

  express.post('/api/devices/:ieeeAddr/get', async (req, res) => {
    try {
      const device: Device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
      if (device) {
        const state = await platform.zigBeeClient.getState(device, req.body);
        res.status(constants.HTTP_STATUS_OK);
        res.contentType('application/json');
        res.end(JSON.stringify({ state }));
      } else {
        res.status(constants.HTTP_STATUS_NOT_FOUND);
        res.end();
      }
    } catch (e) {
      res.send(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      res.end(JSON.stringify(e.message));
    }
  });
}
