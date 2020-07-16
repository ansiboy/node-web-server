/// <reference types="node" />
import { RequestProcessor, RequestContext, ExecuteResult } from "../request-processor";
import http = require('http');
export interface ProxyItem {
    targetUrl: string;
    headers?: {
        [name: string]: string;
    } | ((requestContext: RequestContext) => {
        [name: string]: string;
    } | Promise<{
        [name: string]: string;
    }>);
}
export interface ProxyConfig {
    proxyTargets: {
        [key: string]: ProxyItem | string;
    };
}
export declare class ProxyRequestProcessor implements RequestProcessor {
    #private;
    constructor(config: ProxyConfig);
    get proxyTargets(): {
        [key: string]: ProxyItem;
    };
    execute(args: RequestContext): Promise<ExecuteResult | null>;
}
export declare function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, headers: http.IncomingMessage["headers"], method?: string): Promise<ExecuteResult>;
