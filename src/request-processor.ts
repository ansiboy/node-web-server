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
    statusMessage?: string,
    content: Content,
    headers?: { [key: string]: string | string[] | undefined }
}

export interface RequestProcessor {
    /** 优先级别，数字越小越优先，空值优先级别最低 */
    priority?: number;
    execute(ctx: RequestContext): RequestResult | Promise<RequestResult | null> | null;
}
export type RequestProcessorType = { new(config?: any): RequestProcessor };