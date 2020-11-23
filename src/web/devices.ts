import { Express } from 'express';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { constants } from 'http2';
import { Device } from 'zigbee-herdsman/dist/controller/model';

export function mapDevicesRoutes(express: Express, zigBee: ZigBeeClient) {
  express.get('/devices', (req, res) => {
    const devices: Device[] = zigBee.getAllPairedDevices();
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ devices }));
  });

  express.get('/devices/:ieeeAddr', (req, res) => {
    const device: Device = zigBee.getDevice(req.params.ieeeAddr);
    res.status(constants.HTTP_STATUS_OK);
    res.contentType('application/json');
    res.end(JSON.stringify({ device }));
  });
}
