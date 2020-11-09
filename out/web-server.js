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
var _websiteDirectory, _requestProcessors, _settings, _source, _requestResultTransforms, _defaultLogSettings, _logSettings;
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const url = require("url");
const errors_1 = require("./errors");
const virtual_directory_1 = require("./virtual-directory");
const content_types_1 = require("./content-types");
const proxy_1 = require("./request-processors/proxy");
const static_file_1 = require("./request-processors/static-file");
const status_code_1 = require("./status-code");
const cgi_1 = require("./request-processors/cgi");
const logger_1 = require("./logger");
const stream = require("stream");
const path = require("path");
const headers_1 = require("./request-processors/headers");
const DefaultWebSitePath = "../sample-website";
class WebServer {
    constructor(settings) {
        _websiteDirectory.set(this, void 0);
        _requestProcessors.set(this, void 0);
        _settings.set(this, void 0);
        _source.set(this, void 0);
        _requestResultTransforms.set(this, void 0);
        _defaultLogSettings.set(this, {
            level: "all",
            filePath: "log.txt",
        });
        _logSettings.set(this, void 0);
        settings = settings || {};
        if (settings == null)
            throw errors_1.errors.argumentNull("settings");
        if (settings.websiteDirectory == null) {
            __classPrivateFieldSet(this, _websiteDirectory, new virtual_directory_1.VirtualDirectory(path.join(__dirname, DefaultWebSitePath)));
        }
        else if (typeof settings.websiteDirectory == "string") {
            __classPrivateFieldSet(this, _websiteDirectory, new virtual_directory_1.VirtualDirectory(settings.websiteDirectory));
        }
        else {
            __classPrivateFieldSet(this, _websiteDirectory, settings.websiteDirectory);
        }
        __classPrivateFieldSet(this, _settings, settings);
        __classPrivateFieldSet(this, _logSettings, Object.assign(settings.log || {}, __classPrivateFieldGet(this, _defaultLogSettings)));
        __classPrivateFieldSet(this, _source, this.start());
        // if (!settings.port) {
        //     let address = this.#source.address() as AddressInfo;
        //     settings.port = address.port;
        // }
        let configs = __classPrivateFieldGet(this, _settings).requestProcessorConfigs || {};
        let types = __classPrivateFieldGet(this, _settings).requestProcessorTypes || WebServer.defaultRequestProcessorTypes;
        __classPrivateFieldSet(this, _requestProcessors, types.map((type) => {
            let name = type.name;
            let alias = name.endsWith("RequestProcessor") ? name.substring(0, name.length - "RequestProcessor".length) : name;
            let config = configs[name] || configs[alias] || {};
            let processor = new type(config);
            return processor;
        }));
        __classPrivateFieldSet(this, _requestResultTransforms, settings.requestResultTransforms || []);
    }
    /** 网站文件夹 */
    get websiteDirectory() {
        return __classPrivateFieldGet(this, _websiteDirectory);
    }
    /** 端口 */
    get port() {
        if (__classPrivateFieldGet(this, _settings).port == null) {
            let address = __classPrivateFieldGet(this, _source).address();
            // TODO: address is null
            return address.port;
        }
        return __classPrivateFieldGet(this, _settings).port;
    }
    /** 请求处理器实例 */
    get requestProcessors() {
        return __classPrivateFieldGet(this, _requestProcessors);
    }
    get source() {
        return __classPrivateFieldGet(this, _source);
    }
    /** 内容转换器 */
    get contentTransforms() {
        return __classPrivateFieldGet(this, _requestResultTransforms);
    }
    start() {
        let settings = __classPrivateFieldGet(this, _settings);
        let server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
            let u = url.parse(req.url || "");
            let path = u.pathname || "";
            for (let i = 0; i < __classPrivateFieldGet(this, _requestProcessors).length; i++) {
                let processor = __classPrivateFieldGet(this, _requestProcessors)[i];
                try {
                    let r = null;
                    let requestContext = {
                        virtualPath: path, rootDirectory: __classPrivateFieldGet(this, _websiteDirectory),
                        req, res, logLevel: this.logLevel
                    };
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
                        r = yield this.resultTransform(r, requestContext, __classPrivateFieldGet(this, _requestResultTransforms));
                        if (r.statusCode) {
                            res.statusCode = r.statusCode;
                        }
                        if (r.headers) {
                            for (let key in r.headers) {
                                res.setHeader(key, r.headers[key]);
                            }
                            if (r.content instanceof Buffer) {
                                res.setHeader("Content-Length", r.content.length.toString());
                            }
                        }
                        this.outputContent(r.content, requestContext);
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
    resultTransform(result, requestContext, requestResultTransforms) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < requestResultTransforms.length; i++) {
                let transform = requestResultTransforms[i];
                console.assert(transform != null);
                let r = requestResultTransforms[i](result, requestContext);
                if (r == null)
                    throw errors_1.errors.contentTransformResultNull();
                if (r.then != null)
                    result = yield r;
                else
                    result = r;
            }
            return result;
        });
    }
    outputContent(content, requestContext) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = requestContext.res;
            if (content instanceof stream.Readable) {
                content.pipe(res);
            }
            else {
                res.write(content);
                res.end();
            }
        });
    }
    outputError(err, res) {
        if (err == null) {
            err = new Error(`Unkonwn error because original error is null.`);
            err.name = 'nullError';
        }
        // const defaultErrorStatusCode = 600;
        res.setHeader("content-type", content_types_1.contentTypes.json);
        res.statusCode = err.statusCode || status_code_1.StatusCode.UnknownError;
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
    /** 日志记录器 */
    getLogger(categoryName) {
        let logSetting = __classPrivateFieldGet(this, _settings).log || {};
        return logger_1.getLogger(categoryName, this.logLevel, logSetting.filePath);
    }
    /** 日志等级 */
    get logLevel() {
        return __classPrivateFieldGet(this, _logSettings).level;
    }
}
exports.WebServer = WebServer;
_websiteDirectory = new WeakMap(), _requestProcessors = new WeakMap(), _settings = new WeakMap(), _source = new WeakMap(), _requestResultTransforms = new WeakMap(), _defaultLogSettings = new WeakMap(), _logSettings = new WeakMap();
WebServer.defaultRequestProcessorTypes = [
    headers_1.HeadersRequestProcessor, proxy_1.ProxyRequestProcessor, cgi_1.DynamicRequestProcessor, static_file_1.StaticFileRequestProcessor,
];
