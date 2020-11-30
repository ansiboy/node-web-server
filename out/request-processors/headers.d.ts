import { RequestContext, RequestProcessor } from "..";
export declare type Headers = {
    [name: string]: string | string[];
};
export declare class HeadersRequestProcessor implements RequestProcessor {
    #private;
    constructor();
    get headers(): Headers;
    set headers(value: Headers);
    execute(ctx: RequestContext): null;
}
