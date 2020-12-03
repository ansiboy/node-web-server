/// <reference types="node" />
import * as http from "http";
import { LogLevel } from "./logger";
import * as stream from "stream";
import { VirtualDirectory } from "./virtual-directory";
export declare type Content = string | Buffer | stream.Readable;
export declare type RequestContext = {
    virtualPath: string;
    /** 站点根目录 */
    rootDirectory: VirtualDirectory;
    res: http.ServerResponse;
    req: http.IncomingMessage;
    logLevel: LogLevel;
};
export declare type RequestResult = {
    statusCode?: number;
    content: Content;
    headers?: {
        [key: string]: string | string[] | undefined;
    };
};
export interface RequestProcessor {
    execute(ctx: RequestContext): RequestResult | Promise<RequestResult | null> | null;
}
export declare type RequestProcessorType = {
    new (config?: any): RequestProcessor;
};
