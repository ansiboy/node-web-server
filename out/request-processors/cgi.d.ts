import { RequestProcessor, RequestContext, ExecuteResult } from "../request-processor";
export declare type CGIFunction = (args: RequestContext) => ExecuteResult | Promise<ExecuteResult>;
export declare class CGIRequestProcessor implements RequestProcessor {
    execute(args: RequestContext): ExecuteResult | Promise<ExecuteResult> | null;
}
