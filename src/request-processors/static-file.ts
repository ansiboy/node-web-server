import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import { pathConcat } from "../path-concat";
import { defaultFileProcessors } from "../file-processors";
import { errors } from "../errors";
import { FileProcessor } from "../file-processor";
import * as path from "path";

export type StaticFileProcessorConfig = {
    fileProcessors: { [key: string]: FileProcessor }
}

export class StaticFileRequestProcessor implements RequestProcessor {

    #fileProcessors: { [key: string]: FileProcessor };

    constructor(config?: StaticFileProcessorConfig) {
        config = config || { fileProcessors: {} };
        this.#fileProcessors = Object.assign(config.fileProcessors || {}, defaultFileProcessors);
    }

    async execute(args: RequestContext): Promise<RequestResult> {

        if (args.physicalPath == null)
            throw errors.pageNotFound(args.virtualPath);

        let ext = "";
        if (args.physicalPath.indexOf(".") < 0) {
            args.physicalPath = pathConcat(args.physicalPath, "index.html");
        }

        ext = path.extname(args.physicalPath);

        let fileProcessor = this.#fileProcessors[ext];
        if (fileProcessor == null)
            throw errors.fileTypeNotSupport(ext);

        let p = fileProcessor(args) as Promise<RequestResult>;
        if (p.then == null) {
            p = Promise.resolve(p);
        }

        let r = await p;
        let headers = r.headers || {};
        if (args.logLevel == "all") {
            Object.assign(headers, { "physical-path": args.physicalPath || "" })
        }
        return {
            statusCode: r.statusCode, content: r.content, headers: r.headers
        };
    }

    get fileProcessors() {
        return this.#fileProcessors;
    }

}

export let staticFileRequestProcessor = new StaticFileRequestProcessor();