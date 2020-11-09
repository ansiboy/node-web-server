"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _fileProcessors;
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
    ".jpg": text_file_1.staticFileProcessor,
};
// ".woff": staticFileProcessor,
// ".woff2": staticFileProcessor,
// ".ttf": staticFileProcessor,
class StaticFileRequestProcessor {
    constructor(config) {
        _fileProcessors.set(this, void 0);
        config = config || {};
        __classPrivateFieldSet(this, _fileProcessors, Object.assign({}, exports.defaultFileProcessors, config.fileProcessors || {}));
        if (config.staticFileExtentions) {
            for (let i = 0; i < config.staticFileExtentions.length; i++) {
                if (config.staticFileExtentions[i][0] != ".")
                    config.staticFileExtentions[i] = "." + config.staticFileExtentions[i];
                __classPrivateFieldGet(this, _fileProcessors)[config.staticFileExtentions[i]] = text_file_1.staticFileProcessor;
            }
        }
    }
    execute(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
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
            let fileProcessor = __classPrivateFieldGet(this, _fileProcessors)[ext];
            if (fileProcessor == null)
                throw errors_1.errors.fileTypeNotSupport(ext);
            let p = fileProcessor({ virtualPath: virtualPath, physicalPath: physicalPath }, ctx);
            if (p.then == null) {
                p = Promise.resolve(p);
            }
            let r = yield p;
            let headers = r.headers || {};
            if (ctx.logLevel == "all") {
                Object.assign(headers, { "physical-path": physicalPath || "" });
            }
            return {
                statusCode: r.statusCode, content: r.content, headers: r.headers
            };
        });
    }
    get fileProcessors() {
        return __classPrivateFieldGet(this, _fileProcessors);
    }
}
exports.StaticFileRequestProcessor = StaticFileRequestProcessor;
_fileProcessors = new WeakMap();
// export let staticFileRequestProcessor = new StaticFileRequestProcessor();
