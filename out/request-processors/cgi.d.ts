import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
export declare type CGIFunction = (args: RequestContext) => RequestResult | Promise<RequestResult>;
export declare class CGIRequestProcessor implements RequestProcessor {
    execute(args: RequestContext): RequestResult | Promise<RequestResult> | null;
}
