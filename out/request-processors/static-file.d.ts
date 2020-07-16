import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import { FileProcessor } from "../file-processor";
export declare type StaticFileProcessorConfig = {
    fileProcessors: {
        [key: string]: FileProcessor;
    };
};
export declare class StaticFileRequestProcessor implements RequestProcessor {
    #private;
    constructor(config?: StaticFileProcessorConfig);
    execute(args: RequestContext): Promise<RequestResult>;
    get fileProcessors(): {
        [key: string]: FileProcessor;
    };
}
export declare let staticFileRequestProcessor: StaticFileRequestProcessor;
