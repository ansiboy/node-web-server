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

        let virtualPath = args.virtualPath;
        if (virtualPath.indexOf(".") < 0) {
            virtualPath = pathConcat(virtualPath, "index.html");
        }

        let physicalPath = args.rootDirectory.findFile(virtualPath);
        if (physicalPath == null)
            throw errors.pageNotFound(virtualPath);

        let ext = "";
        if (physicalPath.indexOf(".") < 0) {
            physicalPath = pathConcat(physicalPath, "index.html");
        }

        ext = path.extname(physicalPath);

        let fileProcessor = this.#fileProcessors[ext];
        if (fileProcessor == null)
            throw errors.fileTypeNotSupport(ext);

        let p = fileProcessor({ virtualPath: virtualPath, physicalPath: physicalPath }) as Promise<RequestResult>;
        if (p.then == null) {
            p = Promise.resolve(p);
        }

        let r = await p;
        let headers = r.headers || {};
        if (args.logLevel == "all") {
            Object.assign(headers, { "physical-path": physicalPath || "" })
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