import { RequestContext, RequestProcessor } from "..";
export interface HeadersRequestProcessorConfig {
    headers?: {
        [name: string]: string | string[];
    };
}
export declare class HeadersRequestProcessor implements RequestProcessor {
    #private;
    constructor(config?: HeadersRequestProcessorConfig);
    execute(ctx: RequestContext): null;
}
