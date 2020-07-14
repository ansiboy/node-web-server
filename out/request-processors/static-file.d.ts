import { RequestProcessor, RequestContext, ExecuteResult } from "../request-processor";
import { FileProcessor } from "../file-processor";
export declare type StaticFileProcessorConfig = {
    fileProcessors: {
        [key: string]: FileProcessor;
    };
};
export declare class StaticFileRequestProcessor implements RequestProcessor {
    #private;
    constructor(config?: StaticFileProcessorConfig);
    execute(args: RequestContext): ExecuteResult;
    get fileProcessors(): {
        [key: string]: FileProcessor;
    };
}
export declare let staticFileRequestProcessor: StaticFileRequestProcessor;
