import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import { pathConcat } from "../path-concat";
// import { defaultFileProcessors } from "../file-processors";
import { errors } from "../errors";
import * as path from "path";
import { StatusCode } from "../status-code";
import { errorPages } from "../error-pages";
import * as fs from "fs";
import { defaultContentTypes } from "../content-types";
import { processorPriorities } from "./priority";

interface Options {
    /** 内容类型 */
    contentTypes: { [key: string]: string },

    /** 文件夹虚拟路径 */
    directoryPath?: string | null,
}

export class StaticFileRequestProcessor implements RequestProcessor<Options> {

    priority = processorPriorities.StaticFileRequestProcessor;

    options: Options = { contentTypes: {} };

    constructor() {

    }

    get contentTypes(): Options["contentTypes"] {
        return this.options.contentTypes;
    }
    set contentTypes(value) {
        this.options.contentTypes = value || {};
    }

    /** 获取静态文件夹路径 */
    get staticPath() {
        return this.options.directoryPath;
    }
    /** 设置静态文件夹路径 */
    set staticPath(value: string | null | undefined) {
        this.options.directoryPath = value;
    }

    async execute(ctx: RequestContext): Promise<RequestResult | null> {

        let virtualPath = ctx.virtualPath;
        if (virtualPath.indexOf(".") < 0) {
            virtualPath = pathConcat(virtualPath, "index.html");
        }

        var dir = this.staticPath ? ctx.rootDirectory.findDirectory(this.staticPath) : ctx.rootDirectory;

        let physicalPath: string | null = null;
        if (dir != null) {
            physicalPath = dir.findFile(virtualPath);
        }

        if (physicalPath == null) {
            return null;
        }

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
            let contentType = this.contentTypes[ext] || defaultContentTypes[ext];
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
}
