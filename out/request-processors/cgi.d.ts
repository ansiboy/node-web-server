import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
export declare type DynamicScriptFunction = (args: RequestContext) => RequestResult | Promise<RequestResult>;
export declare type DynamicRequestProcessorConfig = {
    path?: string;
};
export declare class DynamicRequestProcessor implements RequestProcessor {
    #private;
    constructor(config?: DynamicRequestProcessorConfig);
    execute(args: RequestContext): RequestResult | Promise<RequestResult> | null;
}
