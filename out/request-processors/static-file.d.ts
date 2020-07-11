import { RequestProcessor, RequestContext, ExecuteResult } from "../request-processor";
import { FileProcessors } from "../file-processor";
export declare type StaticFileProcessorConfig = {
    fileProcessors: FileProcessors;
};
export declare class StaticFileRequestProcessor implements RequestProcessor {
    #private;
    constructor();
    execute(args: RequestContext): ExecuteResult;
    get fileProcessors(): FileProcessors;
}
export declare let staticFileRequestProcessor: StaticFileRequestProcessor;
