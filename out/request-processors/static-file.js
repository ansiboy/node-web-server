"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_concat_1 = require("../path-concat");
// import { defaultFileProcessors } from "../file-processors";
const errors_1 = require("../errors");
const path = require("path");
const status_code_1 = require("../status-code");
const error_pages_1 = require("../error-pages");
const fs = require("fs");
const content_types_1 = require("../content-types");
const priority_1 = require("./priority");
class StaticFileRequestProcessor {
    constructor() {
        this.#contentTypes = Object.assign({}, content_types_1.defaultContentTypes);
        this.#path = null;
        this.priority = priority_1.processorPriorities.StaticFileRequestProcessor;
    }
    #contentTypes;
    #path;
    get contentTypes() {
        return this.#contentTypes;
    }
    /** 获取静态文件夹路径 */
    get staticPath() {
        return this.#path;
    }
    /** 设置静态文件夹路径 */
    set staticPath(value) {
        this.#path = value;
    }
    async execute(ctx) {
        let virtualPath = ctx.virtualPath;
        if (virtualPath.indexOf(".") < 0) {
            virtualPath = path_concat_1.pathConcat(virtualPath, "index.html");
        }
        var dir = this.staticPath ? ctx.rootDirectory.findDirectory(this.staticPath) : ctx.rootDirectory;
        let physicalPath = null;
        if (dir != null) {
            physicalPath = dir.findFile(virtualPath);
        }
        if (physicalPath == null)
            throw errors_1.errors.pageNotFound(ctx.virtualPath);
        let p = this.processStaticFile(physicalPath);
        if (p.then == null) {
            p = Promise.resolve(p);
        }
        let r = await p;
        let headers = r.headers || {};
        if (ctx.logLevel == "all") {
            Object.assign(headers, { "physical-path": physicalPath || "" });
        }
        return {
            statusCode: r.statusCode, content: r.content, headers: r.headers
        };
    }
    processStaticFile(physicalPath) {
        return new Promise((resolve, reject) => {
            if (!physicalPath) {
                return resolve({ statusCode: status_code_1.StatusCode.NotFound, content: Buffer.from(error_pages_1.errorPages.NotFound) });
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
                throw errors_1.errors.fileTypeNotSupport(ext);
            let stat = fs.statSync(physicalPath);
            let data = fs.createReadStream(physicalPath);
            let mtime = stat.mtime.valueOf();
            let headers = {
                "Content-Type": contentType,
                "Etag": JSON.stringify([stat.ino, stat.size, mtime].join('-')),
                "Last-Modified": stat.mtime.toDateString(),
            };
            resolve({ statusCode: status_code_1.StatusCode.OK, content: data, headers });
        });
    }
}
exports.StaticFileRequestProcessor = StaticFileRequestProcessor;
// export let staticFileRequestProcessor = new StaticFileRequestProcessor();
