import { RequestProcessor, RequestProcessorArguments, RequestProcessorResult } from "../request-processor";
import { pathConcat } from "../path-concat";
import { defaultFileProcessors } from "../file-processors";
import { errors } from "../errors";
import { FileProcessors } from "../file-processor";


export type StaticFileProcessorConfig = {
    fileProcessors: FileProcessors
}

export class StaticFileRequestProcessor implements RequestProcessor {

    #fileProcessors: FileProcessors;

    constructor() {
        this.#fileProcessors = Object.assign({}, defaultFileProcessors);
    }

    execute(args: RequestProcessorArguments): RequestProcessorResult {
        
        if (args.physicalPath == null)
            throw errors.pageNotFound(args.virtualPath);

        let ext = "";
        if (args.physicalPath.indexOf(".") < 0) {
            args.physicalPath = pathConcat(args.physicalPath, "index.html");
        }

        let arr = args.physicalPath.split(".");
        console.assert(arr.length == 2);
        ext = arr[1];

        let fileProcessor = this.#fileProcessors[ext];
        if (fileProcessor == null)
            throw errors.fileTypeNotSupport(ext);

        let r = fileProcessor(args);
        if (r.statusCode)
            args.res.statusCode = r.statusCode;

        if (r.contentType)
            args.res.setHeader("content-type", r.contentType);

        args.res.write(r.content);
        args.res.end();

        return {};
    }

    get fileProcessors() {
        return this.#fileProcessors;
    }

}

export let staticFileRequestProcessor = new StaticFileRequestProcessor();