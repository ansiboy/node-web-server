import * as http from "http";
export type Content = string | Promise<string>;
// export type RequestProcessor = (args: {
//     virtualPath: string, physicalPath?: string | null,
//     config: any
// }) =>
//     { statusCode?: number, content: Content, contentType?: string } | null;

export type RequestProcessorArguments = {
    virtualPath: string, physicalPath?: string | null,
    res: http.ServerResponse, req: http.IncomingMessage
}

export type RequestProcessorResult = {
    statusCode?: number, contentType?: string
} | null

export interface RequestProcessor {
    execute(args: RequestProcessorArguments): RequestProcessorResult;
}