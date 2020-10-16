import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import { FileProcessor } from "../file-processor";
export declare type StaticFileRequestProcessorConfig = {
    fileProcessors?: {
        [key: string]: FileProcessor;
    };
    staticFileExtentions?: string[];
};
export declare let defaultFileProcessors: {
    [key: string]: FileProcessor;
};
export declare class StaticFileRequestProcessor implements RequestProcessor {
    #private;
    constructor(config?: StaticFileRequestProcessorConfig);
    execute(ctx: RequestContext): Promise<RequestResult>;
    get fileProcessors(): {
        [key: string]: FileProcessor;
    };
}
