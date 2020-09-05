"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_concat_1 = require("../path-concat");
// import { defaultFileProcessors } from "../file-processors";
const errors_1 = require("../errors");
const path = require("path");
const text_file_1 = require("../file-processors/text-file");
exports.defaultFileProcessors = {
    ".txt": text_file_1.staticFileProcessor,
    ".html": text_file_1.staticFileProcessor,
    ".js": text_file_1.staticFileProcessor,
    ".css": text_file_1.staticFileProcessor,
    ".json": text_file_1.staticFileProcessor,
    ".woff": text_file_1.staticFileProcessor,
    ".woff2": text_file_1.staticFileProcessor,
    ".ttf": text_file_1.staticFileProcessor,
};
class StaticFileRequestProcessor {
    constructor(config) {
        config = config || {};
        this.#fileProcessors = Object.assign({}, exports.defaultFileProcessors, config.fileProcessors || {});
        if (config.staticFileExtentions) {
            for (let i = 0; i < config.staticFileExtentions.length; i++) {
                if (config.staticFileExtentions[i][0] != ".")
                    config.staticFileExtentions[i] = "." + config.staticFileExtentions[i];
                this.#fileProcessors[config.staticFileExtentions[i]] = text_file_1.staticFileProcessor;
            }
        }
    }
    #fileProcessors;
    async execute(ctx) {
        let virtualPath = ctx.virtualPath;
        if (virtualPath.indexOf(".") < 0) {
            virtualPath = path_concat_1.pathConcat(virtualPath, "index.html");
        }
        let physicalPath = ctx.rootDirectory.findFile(virtualPath);
        if (physicalPath == null)
            throw errors_1.errors.pageNotFound(virtualPath);
        let ext = "";
        if (physicalPath.indexOf(".") < 0) {
            physicalPath = path_concat_1.pathConcat(physicalPath, "index.html");
        }
        ext = path.extname(physicalPath);
        let fileProcessor = this.#fileProcessors[ext];
        if (fileProcessor == null)
            throw errors_1.errors.fileTypeNotSupport(ext);
        let p = fileProcessor({ virtualPath: virtualPath, physicalPath: physicalPath }, ctx);
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
    get fileProcessors() {
        return this.#fileProcessors;
    }
}
exports.StaticFileRequestProcessor = StaticFileRequestProcessor;
exports.staticFileRequestProcessor = new StaticFileRequestProcessor();
