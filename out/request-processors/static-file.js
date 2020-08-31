"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_concat_1 = require("../path-concat");
const file_processors_1 = require("../file-processors");
const errors_1 = require("../errors");
const path = require("path");
class StaticFileRequestProcessor {
    constructor(config) {
        config = config || { fileProcessors: {} };
        this.#fileProcessors = Object.assign(config.fileProcessors || {}, file_processors_1.defaultFileProcessors);
    }
    #fileProcessors;
    async execute(args) {
        let virtualPath = args.virtualPath;
        if (virtualPath.indexOf(".") < 0) {
            virtualPath = path_concat_1.pathConcat(virtualPath, "index.html");
        }
        let physicalPath = args.rootDirectory.findFile(virtualPath);
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
        let p = fileProcessor({ virtualPath: virtualPath, physicalPath: physicalPath });
        if (p.then == null) {
            p = Promise.resolve(p);
        }
        let r = await p;
        let headers = r.headers || {};
        if (args.logLevel == "all") {
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
