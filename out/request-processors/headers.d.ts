import { RequestContext, RequestProcessor } from "..";
export interface HeadersRequestProcessorConfig {
    headers?: {
        [name: string]: string | string[];
    };
}
export declare class HeadersRequestProcessor implements RequestProcessor {
    #private;
    constructor();
    get headers(): {
        [name: string]: string | string[];
    } | undefined;
    set headers(value: {
        [name: string]: string | string[];
    } | undefined);
    execute(ctx: RequestContext): null;
}
