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

  constructor(host: string = '0.0.0.0', port: number = 9000) {
    this.port = port;
    this.host = host;
    this.express = express();
  }

  public start(zigBee: ZigBeeClient) {
    this.express.set('host', this.host);
    this.express.set('port', this.port);
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.server = http.createServer(this.express);
    mapDevicesRoutes(this.express, zigBee);
    mapCoordinatorRoutes(this.express, zigBee);
    this.server.listen(this.port, this.host);
    this.server.on('error', error => this.handleError(error));
    this.server.on('listening', () => this.handleListening());
  }

  public stop() {
    return new Promise<any>((resolve, reject) => {
      this.server.close(error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private handleError(error) {
    const bind = typeof this.port === 'string' ? `Pipe ${this.port}` : `Port ${this.port}`;

    // handle specific listen errors with friendly messages
    switch (error.name) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        break;
      default:
        throw error;
    }
  }

  private handleListening() {
    const addr = this.server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.info(`Listening on ${bind}`);
  }
}
