import express, { Express } from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { mapDevicesRoutes } from './devices';
import { mapCoordinatorRoutes } from './coordinator';

export class HttpServer {
  private readonly express: Express;
  private server: http.Server;
  private readonly port: number;
  private readonly host: string;

  constructor(host: string = '0.0.0.0', port: number = 9090) {
    this.port = port;
    this.host = host;
    this.express = express();
  }

  public start(zigBee: ZigBeeClient) {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.server = http.createServer(this.express);
    mapDevicesRoutes(this.express, zigBee);
    mapCoordinatorRoutes(this.express, zigBee);
  }
}
