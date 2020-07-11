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
var _root, _requestProcessors, _settings;
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const url = require("url");
const errors_1 = require("./errors");
const virtual_directory_1 = require("./virtual-directory");
const content_types_1 = require("./content-types");
const request_processors_1 = require("./request-processors");
class WebServer {
    constructor(settings) {
        _root.set(this, void 0);
        _requestProcessors.set(this, void 0);
        _settings.set(this, void 0);
        if (settings == null)
            throw errors_1.errors.argumentNull("settings");
        settings.root = settings.root || new virtual_directory_1.VirtualDirectory(__dirname);
        __classPrivateFieldSet(this, _root, settings.root || new virtual_directory_1.VirtualDirectory(__dirname));
        __classPrivateFieldSet(this, _settings, settings);
        let s = this.start(settings);
        if (!settings.port) {
            let address = s.address();
            settings.port = address.port;
        }
        __classPrivateFieldSet(this, _requestProcessors, [request_processors_1.requestProcessors.proxy, request_processors_1.requestProcessors.static]);
    }
    get root() {
        return __classPrivateFieldGet(this, _root);
    }
    get port() {
        return __classPrivateFieldGet(this, _settings).port;
    }
    get requestProcessors() {
        return request_processors_1.requestProcessors;
    }
    start(settings) {
        let server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let u = url.parse(req.url || "");
            let path = u.path || "";
            let physicalPath = null;
            if (path.indexOf(".") < 0) {
                let dir = (_a = settings.root) === null || _a === void 0 ? void 0 : _a.findDirectory(path);
                physicalPath = dir === null || dir === void 0 ? void 0 : dir.physicalPath;
            }
            else {
                physicalPath = (_b = settings.root) === null || _b === void 0 ? void 0 : _b.findFile(path);
            }
            for (let i = 0; i < __classPrivateFieldGet(this, _requestProcessors).length; i++) {
                let processor = __classPrivateFieldGet(this, _requestProcessors)[i];
                try {
                    let r = null;
                    let requestContext = { virtualPath: path, physicalPath, req, res };
                    let p = processor.execute(requestContext);
                    if (p == null)
                        continue;
                    if (p.then != null) {
                        r = yield p;
                    }
                    else {
                        r = p;
                    }
                    if (r != null) {
                        if (r.statusCode) {
                            res.statusCode = r.statusCode;
                        }
                        if (r.contentType) {
                            res.setHeader("content-type", r.contentType);
                        }
                        this.outputContent(r.content, requestContext, settings.contentTransforms || []);
                        return;
                    }
                }
                catch (err) {
                    this.outputError(err, res);
                    return;
                }
            }
            // 404
            this.outputError(errors_1.errors.pageNotFound(path), res);
        }));
        return server.listen(settings.port, settings.bindIP);
    }
    outputContent(content, requestContext, contentTransforms) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < contentTransforms.length; i++) {
                let transform = contentTransforms[i];
                console.assert(transform != null);
                let r = contentTransforms[i](content);
                if (r == null)
                    throw errors_1.errors.contentTransformResultNull();
                if (r.then != null)
                    content = yield r;
                else
                    content = r;
            }
            let res = requestContext.res;
            res.write(content);
            res.end();
        });
    }
    outputError(err, res) {
        if (err == null) {
            err = new Error(`Unkonwn error because original error is null.`);
            err.name = 'nullError';
        }
        const defaultErrorStatusCode = 600;
        res.setHeader("content-type", content_types_1.contentTypes.applicationJSON);
        res.statusCode = err.statusCode || defaultErrorStatusCode;
        res.statusMessage = err.name; // statusMessage 不能为中文，否则会出现 invalid chartset 的异常
        if (/^\d\d\d\s/.test(err.name)) {
            res.statusCode = Number.parseInt(err.name.substr(0, 3));
            err.name = err.name.substr(4);
        }
        let outputObject = this.errorOutputObject(err);
        let str = JSON.stringify(outputObject);
        res.write(str);
        res.end();
    }
    errorOutputObject(err) {
        let outputObject = { message: err.message, name: err.name, stack: err.stack };
        if (err.innerError) {
            outputObject['innerError'] = this.errorOutputObject(err.innerError);
        }
        return outputObject;
    }
}
exports.WebServer = WebServer;
_root = new WeakMap(), _requestProcessors = new WeakMap(), _settings = new WeakMap();
//# sourceMappingURL=web-server.js.map