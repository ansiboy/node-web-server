/// <reference types="node" />
import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import http = require('http');
export interface ProxyItem {
    /** 转发请求的目标地址 */
    targetUrl: string;
    /** HTTP header 信息 */
    headers?: {
        [name: string]: string;
    } | ((requestContext: RequestContext) => {
        [name: string]: string;
    } | Promise<{
        [name: string]: string;
    }>);
}
export interface ProxyRequestProcessorConfig {
    /** 转发目标 */
    proxyTargets: {
        [key: string]: ProxyItem | string;
    };
}
export declare class ProxyRequestProcessor implements RequestProcessor {
    #private;
    constructor();
    get proxyTargets(): {
        [key: string]: string | ProxyItem;
    };
    set proxyTargets(value: {
        [key: string]: string | ProxyItem;
    });
    execute(args: RequestContext): Promise<RequestResult | null>;
}
export declare function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, headers: http.IncomingMessage["headers"], method?: string): Promise<RequestResult>;
