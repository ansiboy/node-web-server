import * as http from "http";
import { LogLevel } from "./logger";
export type Content = string | Buffer;

export type RequestContext = {
    virtualPath: string, physicalPath?: string | null,
    res: http.ServerResponse, req: http.IncomingMessage,
    logLevel: LogLevel
}

export type RequestResult = {
    statusCode?: number,
    content: Content,
    headers?: { [key: string]: string }
}

export interface RequestProcessor {
    execute(args: RequestContext): RequestResult | Promise<RequestResult | null> | null;
}