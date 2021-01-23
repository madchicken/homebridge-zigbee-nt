import express, { Express } from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import { mapDevicesRoutes } from './devices';
import { mapCoordinatorRoutes } from './coordinator';
import path from 'path';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { mapZigBeeRoutes } from './zigbee';
import * as WebSocket from 'ws';
import { withPrefix } from 'homebridge/lib/logger';

const DEFAULT_WEB_PORT = 9000;
const DEFAULT_WEB_HOST = '0.0.0.0';

export class HttpServer {
  private readonly express: Express;
  private server: http.Server;
  private readonly port: number;
  private readonly host: string;
  private wsServer: WebSocket.Server;
  private log;

  constructor(port = DEFAULT_WEB_PORT, host = DEFAULT_WEB_HOST) {
    this.port = port;
    this.host = host;
    this.log = withPrefix('ZigBee');
    this.express = express();
  }

  public start(zigBee: ZigbeeNTHomebridgePlatform) {
    this.express.set('host', this.host);
    this.express.set('port', this.port);
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(
      '/index.html',
      express.static(path.resolve(__dirname, '../../../dist/public'))
    );
    this.express.use('/favicon.*', express.static(path.resolve(__dirname, '../../../dist/public')));
    this.express.use('/ui.*.js', express.static(path.resolve(__dirname, '../../../dist/public')));
    this.server = http.createServer(this.express);
    this.wsServer = this.startWebSocketServer(this.server);
    mapDevicesRoutes(this.express, zigBee);
    mapCoordinatorRoutes(this.express, zigBee);
    mapZigBeeRoutes(this.express, zigBee);
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
          resolve(null);
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
        console.error(error);
    }
  }

  private handleListening() {
    const addr = this.server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.info(`Listening on ${bind}`);
  }

  private startWebSocketServer(server: http.Server): WebSocket.Server {
    //initialize the WebSocket server instance
    const wss = new WebSocket.Server({ server });
    this.log.info(`WebSocket server started @ ${wss.host}:${wss.port}`);
    wss.on('connection', (ws: WebSocket) => {
      //connection is up, let's add a simple simple event
      ws.on('message', (message: string) => {
        ws.send(`Hello, you sent -> ${message}`);
      });

      ws.send(JSON.stringify({ type: 'message', message: 'Connection established' }));
    });

    return wss;
  }
}
