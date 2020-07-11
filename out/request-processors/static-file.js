"use strict";
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
const file_processors_1 = require("../file-processors");
const errors_1 = require("../errors");
class StaticFileRequestProcessor {
    constructor() {
        _fileProcessors.set(this, void 0);
        __classPrivateFieldSet(this, _fileProcessors, Object.assign({}, file_processors_1.defaultFileProcessors));
    }
    execute(args) {
        if (args.physicalPath == null)
            throw errors_1.errors.pageNotFound(args.virtualPath);
        let ext = "";
        if (args.physicalPath.indexOf(".") < 0) {
            args.physicalPath = path_concat_1.pathConcat(args.physicalPath, "index.html");
        }
        let arr = args.physicalPath.split(".");
        console.assert(arr.length == 2);
        ext = arr[1];
        let fileProcessor = __classPrivateFieldGet(this, _fileProcessors)[ext];
        if (fileProcessor == null)
            throw errors_1.errors.fileTypeNotSupport(ext);
        let r = fileProcessor(args);
        return { statusCode: r.statusCode, content: r.content, contentType: r.contentType };
    }
    get fileProcessors() {
        return __classPrivateFieldGet(this, _fileProcessors);
    }
}
exports.StaticFileRequestProcessor = StaticFileRequestProcessor;
_fileProcessors = new WeakMap();
exports.staticFileRequestProcessor = new StaticFileRequestProcessor();
//# sourceMappingURL=static-file.js.map