import * as http from "http";
import { LogLevel } from "./logger";
import * as stream from "stream";
import { VirtualDirectory } from "./virtual-directory";

export type Content = string | Buffer | stream.Readable;

export type RequestContext = {
    virtualPath: string, //physicalPath?: string | null,
    /** 站点根目录 */
    rootDirectory: VirtualDirectory,
    res: http.ServerResponse, req: http.IncomingMessage,
    logLevel: LogLevel
}

export type RequestResult = {
    statusCode?: number,
    content: Content,
    headers?: { [key: string]: string }
}

export interface RequestProcessor {
    execute(ctx: RequestContext): RequestResult | Promise<RequestResult | null> | null;
}
export type RequestProcessorType = { new(config?: any): RequestProcessor };