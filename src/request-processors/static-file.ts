import { RequestProcessor, RequestContext, ExecuteResult } from "../request-processor";
import { pathConcat } from "../path-concat";
import { defaultFileProcessors } from "../file-processors";
import { errors } from "../errors";
// import { FileProcessors } from "../file-processor";
import { contentTypes } from "../content-types";
import { FileProcessor } from "../file-processor";

export type StaticFileProcessorConfig = {
    fileProcessors: { [key: string]: FileProcessor }
}

export class StaticFileRequestProcessor implements RequestProcessor {

    #fileProcessors: { [key: string]: FileProcessor };

    constructor(config?: StaticFileProcessorConfig) {
        config = config || { fileProcessors: {} };
        this.#fileProcessors = Object.assign(config.fileProcessors, defaultFileProcessors);
    }

    execute(args: RequestContext): ExecuteResult {
    
        if (args.physicalPath == null)
            throw errors.pageNotFound(args.virtualPath);

        let ext = "";
        if (args.physicalPath.indexOf(".") < 0) {
            args.physicalPath = pathConcat(args.physicalPath, "index.html");
        }

        let arr = args.physicalPath.split(".");
        ext = arr[arr.length - 1];

        let fileProcessor = this.#fileProcessors[ext];
        if (fileProcessor == null)
            throw errors.fileTypeNotSupport(ext);

        let r = fileProcessor(args);
        let contentType = contentTypes[ext as keyof typeof contentTypes] || contentTypes.txt;
        return { statusCode: r.statusCode, content: r.content, contentType: r.contentType || contentType };
    }

    get fileProcessors() {
        return this.#fileProcessors;
    }

}

export let staticFileRequestProcessor = new StaticFileRequestProcessor();