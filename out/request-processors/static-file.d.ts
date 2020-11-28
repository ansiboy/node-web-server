import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
export declare class StaticFileRequestProcessor implements RequestProcessor {
    #private;
    constructor();
    get contentTypes(): {
        [key: string]: string;
    };
    execute(ctx: RequestContext): Promise<RequestResult>;
    private processStaticFile;
}
