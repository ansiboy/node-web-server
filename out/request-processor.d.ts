/// <reference types="node" />
import * as http from "http";
export declare type Content = string | Buffer;
export declare type RequestContext = {
    virtualPath: string;
    physicalPath?: string | null;
    res: http.ServerResponse;
    req: http.IncomingMessage;
};
export declare type ExecuteResult = {
    statusCode?: number;
    contentType?: string;
    content: Content;
    headers?: {
        [key: string]: string;
    };
};
export interface RequestProcessor {
    execute(args: RequestContext): ExecuteResult | Promise<ExecuteResult> | null;
}
