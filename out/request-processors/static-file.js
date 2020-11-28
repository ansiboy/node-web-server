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
class StaticFileRequestProcessor {
    constructor() {
        // #fileProcessors: { [key: string]: FileProcessor };
        this.#contentTypes = Object.assign({}, content_types_1.defaultContentTypes);
    }
    // #fileProcessors: { [key: string]: FileProcessor };
    #contentTypes;
    get contentTypes() {
        return this.#contentTypes;
    }
    async execute(ctx) {
        let virtualPath = ctx.virtualPath;
        if (virtualPath.indexOf(".") < 0) {
            virtualPath = path_concat_1.pathConcat(virtualPath, "index.html");
        }
        let physicalPath = ctx.rootDirectory.findFile(virtualPath);
        if (physicalPath == null)
            throw errors_1.errors.pageNotFound(virtualPath);
        if (physicalPath.indexOf(".") < 0) {
            physicalPath = path_concat_1.pathConcat(physicalPath, "index.html");
        }
        // let fileProcessor = this.#fileProcessors[ext];
        // if (fileProcessor == null)
        //     throw errors.fileTypeNotSupport(ext);
        let p = this.processStaticFile(physicalPath); //fileProcessor({ virtualPath: virtualPath, physicalPath: physicalPath }, ctx) as Promise<RequestResult>;
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
            let key = ext.substr(1);
            let contentType = this.#contentTypes[key] || this.contentTypes[ext];
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
