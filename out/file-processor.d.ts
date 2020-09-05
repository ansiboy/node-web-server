import { RequestResult, RequestContext } from "./request-processor";
export declare type FileProcessor = (args: {
    virtualPath: string;
    physicalPath: string;
}, ctx: RequestContext) => RequestResult | Promise<RequestResult>;
