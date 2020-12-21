import express, { Express } from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import { mapDevicesRoutes } from './devices';
import { mapCoordinatorRoutes } from './coordinator';
import path from 'path';
import { ZigbeeNTHomebridgePlatform } from '../../platform';

export class HttpServer {
  private readonly express: Express;
  private server: http.Server;
  private readonly port: number;
  private readonly host: string;

  constructor(port = 5000, host = '0.0.0.0') {
    this.port = port;
    this.host = host;
    this.express = express();
  }

  public start(zigBee: ZigbeeNTHomebridgePlatform) {
    this.express.set('host', this.host);
    this.express.set('port', this.port);
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use('/public', express.static(path.resolve(__dirname, '../../public')));
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

  private handleError(error: Error) {
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
