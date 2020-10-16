import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import { pathConcat } from "../path-concat";
// import { defaultFileProcessors } from "../file-processors";
import { errors } from "../errors";
import { FileProcessor } from "../file-processor";
import * as path from "path";
import { staticFileProcessor } from "../file-processors/text-file";

export type StaticFileRequestProcessorConfig = {
    fileProcessors?: { [key: string]: FileProcessor },
    // 设置静态文件扩展名
    staticFileExtentions?: string[],
}

export let defaultFileProcessors: { [key: string]: FileProcessor } = {
    ".txt": staticFileProcessor,
    ".html": staticFileProcessor,
    ".js": staticFileProcessor,
    ".css": staticFileProcessor,
    ".json": staticFileProcessor,
    ".jpg": staticFileProcessor,
}

    // ".woff": staticFileProcessor,
    // ".woff2": staticFileProcessor,
    // ".ttf": staticFileProcessor,

export class StaticFileRequestProcessor implements RequestProcessor {

    #fileProcessors: { [key: string]: FileProcessor };

    constructor(config?: StaticFileRequestProcessorConfig) {
        config = config || {};

        this.#fileProcessors = Object.assign({}, defaultFileProcessors, config.fileProcessors || {});
        if (config.staticFileExtentions) {
            for (let i = 0; i < config.staticFileExtentions.length; i++) {
                if (config.staticFileExtentions[i][0] != ".")
                    config.staticFileExtentions[i] = "." + config.staticFileExtentions[i];

                this.#fileProcessors[config.staticFileExtentions[i]] = staticFileProcessor;
            }
        }
    }

    async execute(ctx: RequestContext): Promise<RequestResult> {

        let virtualPath = ctx.virtualPath;
        if (virtualPath.indexOf(".") < 0) {
            virtualPath = pathConcat(virtualPath, "index.html");
        }

        let physicalPath = ctx.rootDirectory.findFile(virtualPath);
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

        let p = fileProcessor({ virtualPath: virtualPath, physicalPath: physicalPath }, ctx) as Promise<RequestResult>;
        if (p.then == null) {
            p = Promise.resolve(p);
        }

        let r = await p;
        let headers = r.headers || {};
        if (ctx.logLevel == "all") {
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

// export let staticFileRequestProcessor = new StaticFileRequestProcessor();