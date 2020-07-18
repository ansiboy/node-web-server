/// <reference types="node" />
import * as http from "http";
import { LogLevel } from "./logger";
export declare type Content = string | Buffer;
export declare type RequestContext = {
    virtualPath: string;
    physicalPath?: string | null;
    res: http.ServerResponse;
    req: http.IncomingMessage;
    logLevel: LogLevel;
};
export declare type RequestResult = {
    statusCode?: number;
    content: Content;
    headers?: {
        [key: string]: string;
    };
};
export interface RequestProcessor {
    execute(args: RequestContext): RequestResult | Promise<RequestResult | null> | null;
}
