"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServer = void 0;
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const bodyParser = __importStar(require("body-parser"));
const devices_1 = require("./devices");
const coordinator_1 = require("./coordinator");
const path_1 = __importDefault(require("path"));
const zigbee_1 = require("./zigbee");
const WebSocket = __importStar(require("ws"));
const serve_static_1 = __importDefault(require("serve-static"));
const url = __importStar(require("url"));
const logger_1 = require("homebridge/lib/logger");
const DEFAULT_WEB_PORT = 9000;
const DEFAULT_WEB_HOST = '0.0.0.0';
function enableCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Content-Type');
}
function setHeaders(res) {
    enableCors(res);
}
const serve = serve_static_1.default(path_1.default.resolve(__dirname, '../../../dist/public'), {
    index: false,
    redirect: false,
    setHeaders: setHeaders,
    dotfiles: 'allow',
});
function middleware(publicURL, logger) {
    function logAccessIfVerbose(req) {
        const protocol = req.connection.encrypted ? 'https' : 'http';
        const fullUrl = `${protocol}://${req.headers.host}${req.url}`;
        logger.debug(`Request: ${fullUrl}`);
    }
    return function (req, res, next) {
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
            req.url = `/${path_1.default.basename('index.html')}`;
            serve(req, res, send404);
        }
        const { pathname } = url.parse(req.url);
        if (pathname.startsWith('/api')) {
            next();
        }
        else if (!pathname.startsWith(publicURL) || path_1.default.extname(pathname) === '') {
            // If the URL doesn't start with the public path, or the URL doesn't
            // have a file extension, send the main HTML bundle.
            return sendIndex();
        }
        else {
            // Otherwise, serve the file from the dist folder
            req.url = pathname.slice(publicURL.length);
            return serve(req, res, sendIndex);
        }
    };
}
class HttpServer {
    constructor(port = DEFAULT_WEB_PORT, host = DEFAULT_WEB_HOST) {
        this.port = port;
        this.host = host;
        this.log = logger_1.withPrefix('ZigBee');
        this.express = express_1.default();
    }
    start(zigBee) {
        this.log.info(`Starting WEB UI on port ${this.port}, host is set to ${this.host}`);
        this.express.set('host', this.host);
        this.express.set('port', this.port);
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(middleware('/', this.log));
        devices_1.mapDevicesRoutes(this.express, zigBee, this.wsServer);
        coordinator_1.mapCoordinatorRoutes(this.express, zigBee);
        zigbee_1.mapZigBeeRoutes(this.express, zigBee);
        this.server = http.createServer(this.express);
        this.wsServer = this.startWebSocketServer(this.server);
        this.server.listen(this.port, this.host);
        this.server.on('error', error => this.handleError(error));
        this.server.on('listening', () => this.handleListening());
    }
    stop() {
        return new Promise((resolve, reject) => {
            this.server.close(error => {
                var _a;
                if (error) {
                    reject(error);
                }
                else {
                    (_a = this.wsServer) === null || _a === void 0 ? void 0 : _a.close(error => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(null);
                        }
                    });
                    resolve(null);
                }
            });
        });
    }
    handleError(error) {
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
    handleListening() {
        const addr = this.server.address();
        const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        this.log.info(`WEB UI Listening on ${bind}`);
    }
    startWebSocketServer(server) {
        //initialize the WebSocket server instance
        const wss = new WebSocket.Server({ server });
        this.log.info(`WebSocket server started @ ${wss.address()}`);
        wss.on('connection', (ws) => {
            //connection is up, let's add a simple simple event
            ws.on('message', (message) => {
                ws.send(`Hello, you sent -> ${message}`);
            });
            ws.send(JSON.stringify({ type: 'message', message: 'Connection established' }));
        });
        return wss;
    }
}
exports.HttpServer = HttpServer;
//# sourceMappingURL=http-server.js.map