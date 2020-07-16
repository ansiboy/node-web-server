import * as http from "http";
export type Content = string | Buffer;

export type RequestContext = {
    virtualPath: string, physicalPath?: string | null,
    res: http.ServerResponse, req: http.IncomingMessage
}

export type RequestResult = {
    statusCode?: number,
    content: Content,
    headers?: { [key: string]: string }
}

export interface RequestProcessor {
    execute(args: RequestContext): RequestResult | Promise<RequestResult | null> | null;
}