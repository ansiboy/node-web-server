"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_concat_1 = require("../path-concat");
const file_processors_1 = require("../file-processors");
const errors_1 = require("../errors");
// import { FileProcessors } from "../file-processor";
const content_types_1 = require("../content-types");
class StaticFileRequestProcessor {
    constructor(config) {
        config = config || { fileProcessors: {} };
        this.#fileProcessors = Object.assign(config.fileProcessors, file_processors_1.defaultFileProcessors);
    }
    #fileProcessors;
    execute(args) {
        if (args.physicalPath == null)
            throw errors_1.errors.pageNotFound(args.virtualPath);
        let ext = "";
        if (args.physicalPath.indexOf(".") < 0) {
            args.physicalPath = path_concat_1.pathConcat(args.physicalPath, "index.html");
        }
        let arr = args.physicalPath.split(".");
        ext = arr[arr.length - 1];
        let fileProcessor = this.#fileProcessors[ext];
        if (fileProcessor == null)
            throw errors_1.errors.fileTypeNotSupport(ext);
        let r = fileProcessor(args);
        let contentType = content_types_1.contentTypes[ext] || content_types_1.contentTypes.txt;
        return { statusCode: r.statusCode, content: r.content, contentType: r.contentType || contentType };
    }
    get fileProcessors() {
        return this.#fileProcessors;
    }
}
exports.StaticFileRequestProcessor = StaticFileRequestProcessor;
exports.staticFileRequestProcessor = new StaticFileRequestProcessor();
