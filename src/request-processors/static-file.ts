import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import { pathConcat } from "../path-concat";
// import { defaultFileProcessors } from "../file-processors";
import { errors } from "../errors";
import * as path from "path";
import { StatusCode } from "../status-code";
import { errorPages } from "../error-pages";
import * as fs from "fs";
import { defaultContentTypes } from "../content-types";

// export type StaticFileRequestProcessorConfig = {
//     fileProcessors?: { [key: string]: FileProcessor },
//     // 设置静态文件扩展名
//     staticFileExtentions?: string[],
// }

// export let defaultFileProcessors: { [key: string]: FileProcessor } = {
//     ".txt": staticFileProcessor,
//     ".html": staticFileProcessor,
//     ".js": staticFileProcessor,
//     ".css": staticFileProcessor,
//     ".json": staticFileProcessor,
//     ".jpg": staticFileProcessor,
// }

// ".woff": staticFileProcessor,
// ".woff2": staticFileProcessor,
// ".ttf": staticFileProcessor,

export class StaticFileRequestProcessor implements RequestProcessor {

    // #fileProcessors: { [key: string]: FileProcessor };
    #contentTypes: { [key: string]: string } = Object.assign({}, defaultContentTypes);

    constructor() {

    }

    get contentTypes() {
        return this.#contentTypes;
    }

    async execute(ctx: RequestContext): Promise<RequestResult> {

        let virtualPath = ctx.virtualPath;
        if (virtualPath.indexOf(".") < 0) {
            virtualPath = pathConcat(virtualPath, "index.html");
        }

        let physicalPath = ctx.rootDirectory.findFile(virtualPath);
        if (physicalPath == null)
            throw errors.pageNotFound(ctx.virtualPath);

        // if (physicalPath.indexOf(".") < 0) {
        //     physicalPath = pathConcat(physicalPath, "index.html");
        // }

        let p = this.processStaticFile(physicalPath);
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

    private processStaticFile(physicalPath: string) {
        return new Promise<RequestResult>((resolve, reject) => {
            if (!physicalPath) {
                return resolve({ statusCode: StatusCode.NotFound, content: Buffer.from(errorPages.NotFound) });
            }

            if (!fs.existsSync(physicalPath)) {
                let text = `Path ${physicalPath} is not exists.`;
                return resolve({ statusCode: 404, content: Buffer.from(text) });
            }

            var ext = path.extname(physicalPath);
            if (!ext)
                return null;

            console.assert(ext.startsWith("."));
            let contentType = this.#contentTypes[ext];
            if (!contentType)
                throw errors.fileTypeNotSupport(ext);

            let stat = fs.statSync(physicalPath);
            let data = fs.createReadStream(physicalPath);
            let mtime: number = stat.mtime.valueOf();
            let headers: RequestResult["headers"] = {
                "Content-Type": contentType,
                "Etag": JSON.stringify([stat.ino, stat.size, mtime].join('-')),
                "Last-Modified": stat.mtime.toDateString(),
            };

            resolve({ statusCode: StatusCode.OK, content: data, headers });
        })
    }

    // get fileProcessors() {
    //     return this.#fileProcessors;
    // }

}

// export let staticFileRequestProcessor = new StaticFileRequestProcessor();