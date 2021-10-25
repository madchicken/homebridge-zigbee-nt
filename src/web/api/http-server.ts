import express, { Express } from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import { mapDevicesRoutes } from './devices';
import { mapCoordinatorRoutes } from './coordinator';
import path from 'path';
import { ZigbeeNTHomebridgePlatform } from '../../platform';
import { mapZigBeeRoutes } from './zigbee';
import * as WebSocket from 'ws';
import serveStatic from 'serve-static';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import * as url from 'url';
import winston from 'winston';

const DEFAULT_WEB_PORT = 9000;
const DEFAULT_WEB_HOST = '0.0.0.0';

function enableCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Content-Type'
  );
}

function setHeaders(res) {
  enableCors(res);
}

const serve = serveStatic(path.resolve(__dirname, '../../../dist/public'), {
  index: false,
  redirect: false,
  setHeaders: setHeaders,
  dotfiles: 'allow',
});

function middleware(publicURL: string, logger: winston.Logger) {
  function logAccessIfVerbose(req) {
    const protocol = req.connection.encrypted ? 'https' : 'http';
    const fullUrl = `${protocol}://${req.headers.host}${req.url}`;

    logger.debug(`Request: ${fullUrl}`);
  }

  return function (req: Request, res: Response, next: NextFunction) {
    logAccessIfVerbose(req);

    function send404() {
      if (next) {
        return next();
      }
      setHeaders(res);
      res.writeHead(404);
      res.end();
    }

    function sendIndex() {
      req.url = `/${path.basename('index.html')}`;
      serve(req, res, send404);
    }

    const { pathname } = url.parse(req.url);
    if (pathname.startsWith('/api')) {
      next();
    } else if (!pathname.startsWith(publicURL) || path.extname(pathname) === '') {
      // If the URL doesn't start with the public path, or the URL doesn't
      // have a file extension, send the main HTML bundle.
      return sendIndex();
    } else {
      // Otherwise, serve the file from the dist folder
      req.url = pathname.slice(publicURL.length);
      return serve(req, res, sendIndex);
    }
  };
}

export class HttpServer {
  private readonly express: Express;
  private server: http.Server;
  private readonly port: number;
  private readonly host: string;
  private wsServer: WebSocket.Server;
  private readonly log: winston.Logger;

  constructor(port = DEFAULT_WEB_PORT, host = DEFAULT_WEB_HOST) {
    this.port = port;
    this.host = host;
    this.log = winston.createLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.printf((info) => `${info.timestamp} [ZigBee-UI] ${info.message}`),
    });
    this.express = express();
  }

  public start(zigBee: ZigbeeNTHomebridgePlatform): void {
    this.log.info(`Starting WEB UI on port ${this.port}, host is set to ${this.host}`);
    this.express.set('host', this.host);
    this.express.set('port', this.port);
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(middleware('/', this.log));
    mapDevicesRoutes(this.express, zigBee, this.wsServer);
    mapCoordinatorRoutes(this.express, zigBee);
    mapZigBeeRoutes(this.express, zigBee);
    this.server = http.createServer(this.express);
    this.wsServer = this.startWebSocketServer(this.server);
    this.server.listen(this.port, this.host);
    this.server.on('error', (error) => this.handleError(error));
    this.server.on('listening', () => this.handleListening());
  }

  public stop(): Promise<void> {
    return new Promise<any>((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          reject(error);
        } else {
          this.wsServer?.close((error) => {
            if (error) {
              reject(error);
            } else {
              resolve(null);
            }
          });
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
        this.log.error(`WEB UI error: ${bind} requires elevated privileges`);
        break;
      case 'EADDRINUSE':
        this.log.error(`WEB UI error: ${bind} is already in use`);
        break;
      default:
        this.log.error(`WEB UI error: ${error.message}`);
    }
  }

  private handleListening() {
    const addr = this.server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    this.log.info(`WEB UI Listening on ${bind}`);
  }

  private startWebSocketServer(server: http.Server): WebSocket.Server {
    //initialize the WebSocket server instance
    const wss = new WebSocket.Server({ server });
    this.log.info(`WebSocket server started @ ${wss.address()}`);
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
