/// <reference types="node" />
import { RequestProcessor, RequestContext, ExecuteResult } from "../request-processor";
import http = require('http');
export interface ProxyItem {
    targetUrl: string;
}
export declare class ProxyRequestProcessor implements RequestProcessor {
    #private;
    constructor();
    get proxyTargets(): {
        [key: string]: ProxyItem;
    };
    execute(args: RequestContext): Promise<ExecuteResult> | null;
}
export declare function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, headers: http.IncomingMessage["headers"], method?: string): Promise<ExecuteResult>;