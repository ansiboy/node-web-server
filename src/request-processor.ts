import * as http from "http";
export type Content = string | Buffer;

export type RequestContext = {
    virtualPath: string, physicalPath?: string | null,
    res: http.ServerResponse, req: http.IncomingMessage
}

export type ExecuteResult = {
    statusCode?: number, contentType?: string, content: Content
} | null

export interface RequestProcessor {
    execute(args: RequestContext): ExecuteResult | Promise<ExecuteResult> | null;
}