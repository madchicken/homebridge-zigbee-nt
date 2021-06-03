import { ZigbeeNTHomebridgePlatform } from '../../platform';
export declare class HttpServer {
    private readonly express;
    private server;
    private readonly port;
    private readonly host;
    private wsServer;
    private readonly log;
    constructor(port?: number, host?: string);
    start(zigBee: ZigbeeNTHomebridgePlatform): void;
    stop(): Promise<any>;
    private handleError;
    private handleListening;
    private startWebSocketServer;
}
//# sourceMappingURL=http-server.d.ts.map