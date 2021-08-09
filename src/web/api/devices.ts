import { Express } from 'express';
import { constants } from 'http2';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { normalizeDeviceModel } from '../common/utils';
import winston from 'winston';
import WebSocket from 'ws';

const logger = winston.createLogger({ transports: [new winston.transports.Console()] });

export function mapDevicesRoutes(
  express: Express,
  platform: ZigbeeNTHomebridgePlatform,
  _webSocket: WebSocket.Server
) {
  express.get('/api/devices', (_req, res) => {
    const devices: Device[] = platform.zigBeeClient.getAllPairedDevices();
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ devices: devices.map(device => normalizeDeviceModel(device)) }));
  });

  express.get('/api/devices/:ieeeAddr', async (req, res) => {
    const device: Device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
    if (device) {
      const deviceModel = normalizeDeviceModel(device);
      deviceModel.otaAvailable = platform.zigBeeClient.hasOTA(device);
      res.status(constants.HTTP_STATUS_OK);
      res.contentType('application/json');
      res.end(JSON.stringify({ device: deviceModel }));
    } else {
      res.status(constants.HTTP_STATUS_NOT_FOUND);
      res.end();
    }
  });

  express.get('/api/devices/:ieeeAddr/checkForUpdates', async (req, res) => {
    const device: Device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
    if (device) {
      let newFirmwareAvailable = 'NO';
      if (platform.zigBeeClient.hasOTA(device)) {
        try {
          newFirmwareAvailable = (await platform.zigBeeClient.isUpdateFirmwareAvailable(device))
            ? 'YES'
            : 'NO';
        } catch (e) {
          logger.error(e.toString(), e);
          newFirmwareAvailable = 'FETCH_ERROR';
        }
      }
      res.status(constants.HTTP_STATUS_OK);
      res.contentType('application/json');
      res.end(JSON.stringify({ newFirmwareAvailable }));
    } else {
      res.status(constants.HTTP_STATUS_NOT_FOUND);
      res.end();
    }
  });

  express.post('/api/devices/:ieeeAddr/updateFirmware', async (req, res) => {
    const device: Device = platform.zigBeeClient.getDevice(req.params.ieeeAddr);
    if (device) {
      if (platform.zigBeeClient.hasOTA(device)) {
        res.status(constants.HTTP_STATUS_OK);
        res.contentType('text/plain; charset=UTF-8');
        res.setHeader('transfer-encoding', 'chunked');
        res.write(`Updating firmware for ${device.ieeeAddr} (${device.manufacturerName} ${device.modelID})…\n`)
        await platform.zigBeeClient.updateFirmware(device, function(percentage, remaining) {
          if (remaining !== null) {
            res.write(`${percentage}% complete with ${Math.round(remaining)}s remaining\n`);
          } else {
            res.write(`${percentage}% complete\n`);
          }
        })
        res.end("Finished.\n");
      }
    } else {
      res.status(constants.HTTP_STATUS_NOT_FOUND);
      res.end();
    }
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

  express.post('/api/devices/:ieeeAddr/ping', async (req, res) => {
    try {
      const ieeeAddr = req.params.ieeeAddr;
      const device: Device = platform.zigBeeClient.getDevice(ieeeAddr);
      if (device) {
        await platform.zigBeeClient.ping(ieeeAddr);
        res.status(constants.HTTP_STATUS_OK);
        res.contentType('application/json');
        res.end(JSON.stringify({ device }));
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
