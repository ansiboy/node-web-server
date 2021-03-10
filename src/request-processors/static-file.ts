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
import { defaultDynamicPath } from "./cgi";

export class StaticFileRequestProcessor implements RequestProcessor {

    priority = processorPriorities.StaticFileRequestProcessor;

    private _contentTypes: { [key: string]: string } = {};
    private _staticPath: string | null = null;
    private _ignorePaths: string[] = [`${defaultDynamicPath}/\\S*`];

    constructor() {

    }

    /** 获取内容类型 */
    get contentTypes() {
        return this._contentTypes;
    }
    /** 设置内容类型 */
    set contentTypes(value) {
        this._contentTypes = value || {};
    }

    /** 获取静态文件夹路径 */
    get staticPath() {
        return this._staticPath;
    }
    /** 设置静态文件夹路径，如果路径位空，则位网站根目录 */
    set staticPath(value: string | null) {
        this._staticPath = value;
    }

    /** 获取忽略的路径 */
    get ignorePaths() {
        return this._ignorePaths;
    }
    /** 设置忽略的路径（正则表达式），如果某些请求的路径不需要处理，设置此参数。 */
    set ignorePaths(value) {
        if (value == null)
            throw errors.argumentNull("value");

        if (!Array.isArray(value))
            throw errors.argumentTypeIncorrect("value", "Array");

        this._ignorePaths = value;
    }

    async execute(ctx: RequestContext): Promise<RequestResult | null> {

        let virtualPath = ctx.virtualPath;
        if (virtualPath.indexOf(".") < 0) {
            virtualPath = pathConcat(virtualPath, "index.html");
        }

        console.assert(this.ignorePaths != null && Array.isArray(this.ignorePaths));
        for (let i = 0; i < this.ignorePaths.length; i++) {
            let reg = new RegExp(this.ignorePaths[i]);
            if (reg.test(virtualPath))
                return null;
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
