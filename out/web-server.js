"use strict";
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
const stream = require("stream");
const path = require("path");
const headers_1 = require("./request-processors/headers");
const collection_1 = require("./request-processors/collection");
const logger_1 = require("./logger");
const load_plugins_1 = require("./load-plugins");
const DefaultWebSitePath = "../sample-website";
class WebServer {
    constructor(settings) {
        this.#contentTransforms = [];
        this.#defaultLogSettings = {
            level: "all",
            filePath: "log.txt",
        };
        // #requestProcessorTypes: RequestProcessorType[] = [];
        this.#defaultRequestProcessors = {
            headers: new headers_1.HeadersRequestProcessor(), proxy: new proxy_1.ProxyRequestProcessor(),
            dynamic: new cgi_1.DynamicRequestProcessor(), static: new static_file_1.StaticFileRequestProcessor(),
        };
        settings = settings || {};
        if (settings.websiteDirectory == null) {
            this.#websiteDirectory = new virtual_directory_1.VirtualDirectory(path.join(__dirname, DefaultWebSitePath));
        }
        else if (typeof settings.websiteDirectory == "string") {
            this.#websiteDirectory = new virtual_directory_1.VirtualDirectory(settings.websiteDirectory);
        }
        else {
            this.#websiteDirectory = settings.websiteDirectory;
        }

        let obj = this.loadConfigFromFile(this.#websiteDirectory);
        if (obj) {
            Object.assign(settings, obj);
        }
        if (settings.virtualPaths) {
            for (let virtualPath in settings.virtualPaths) {
                let physicalPath = settings.virtualPaths[virtualPath];
                if (virtualPath[0] != "/")
                    virtualPath = "/" + virtualPath;
                this.#websiteDirectory.setPath(virtualPath, physicalPath);
            }
        }
        
        this.#settings = settings;
        this.#logSettings = Object.assign({}, this.#defaultLogSettings, settings.log || {});
        this.#requestProcessors = new collection_1.RequestProcessorTypeCollection([
            this.#defaultRequestProcessors.headers, this.#defaultRequestProcessors.proxy,
            this.#defaultRequestProcessors.dynamic, this.#defaultRequestProcessors.static,
        ]);
        this.#source = this.start();
    }
    #websiteDirectory;
    #requestProcessors;
    #settings;
    #source;
    #contentTransforms;
    #defaultLogSettings;
    #logSettings;
    // #requestProcessorTypes: RequestProcessorType[] = [];
    #defaultRequestProcessors;
    /** 网站文件夹 */
    get websiteDirectory() {
        return this.#websiteDirectory;
    }
    /** 端口 */
    get port() {
        if (this.#settings.port == null) {
            let address = this.#source.address();
            // TODO: address is null
            return address.port;
        }
        return this.#settings.port;
    }
    /** 请求处理器实例 */
    get requestProcessors() {
        return this.#requestProcessors;
    }
    get source() {
        return this.#source;
    }
    /** 内容转换器 */
    get contentTransforms() {
        return this.#contentTransforms;
    }
    start() {
        let settings = this.#settings;
        let server = http.createServer(async (req, res) => {
            let u = url.parse(req.url || "");
            let path = u.pathname || "";
            for (let i = 0; i < this.#requestProcessors.length; i++) {
                let processor = this.#requestProcessors.item(i);
                try {
                    let r = null;
                    let requestContext = {
                        virtualPath: path, rootDirectory: this.#websiteDirectory,
                        req, res, logLevel: this.logLevel
                    };
                    let p = processor.execute(requestContext);
                    if (p == null)
                        continue;
                    if (p.then != null) {
                        r = await p;
                    }
                    else {
                        r = p;
                    }
                    if (r != null) {
                        r = await this.resultTransform(r, requestContext, this.#contentTransforms);
                        if (r.statusCode) {
                            res.statusCode = r.statusCode;
                        }
                        if (r.statusMessage) {
                            res.statusMessage = r.statusMessage;
                        }
                        if (r.headers) {
                            for (let key in r.headers) {
                                res.setHeader(key, r.headers[key] || "");
                            }
                            // if (r.content instanceof Buffer) {
                            //     res.setHeader("Content-Length", r.content.length.toString());
                            // }
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
        });
        let packagePath = "../package.json";
        let pkg = require(packagePath);
        let logger = logger_1.getLogger(pkg.name, settings.log?.level);
        load_plugins_1.loadPlugins(this, logger);
        if (settings.processors != null) {
            for (let i = 0; i < this.requestProcessors.length; i++) {
                let requestProcessor = this.requestProcessors.item(i);
                let name = requestProcessor.constructor.name;
                let processorProperties = settings.processors[name];
                for (let prop in processorProperties) {
                    if (requestProcessor[prop]) {
                        requestProcessor[prop] = processorProperties[prop];
                    }
                }
            }
        }
        return server.listen(settings.port, settings.bindIP);
    }
    async resultTransform(result, requestContext, requestResultTransforms) {
        for (let i = 0; i < requestResultTransforms.length; i++) {
            let transform = requestResultTransforms[i];
            console.assert(transform != null);
            let r = typeof transform == "function" ? transform(result, requestContext) : transform.execute(result, requestContext);
            if (r == null)
                throw errors_1.errors.contentTransformResultNull();
            if (r.then != null)
                result = await r;
            else
                result = r;
            if (result == null)
                throw errors_1.errors.contentTransformResultNull();
        }
        return result;
    }
    async outputContent(content, requestContext) {
        let res = requestContext.res;
        if (content instanceof stream.Readable) {
            content.pipe(res);
        }
        else {
            if (content == null) {
                let contentType = (res.getHeader("Content-Type") || "");
                if (contentType.indexOf("json") >= 0) {
                    content = JSON.stringify({});
                }
                else {
                    content = "";
                }
            }
            res.write(content);
            res.end();
        }
    }
    outputError(err, res) {
        if (err == null) {
            err = new Error(`Unkonwn error because original error is null.`);
            err.name = 'nullError';
        }
        res.setHeader("content-type", content_types_1.defaultContentTypes[".json"]);
        if (typeof err == "string") {
            res.statusCode = status_code_1.StatusCode.UnknownError;
            res.statusMessage = err; // statusMessage 不能为中文，否则会出现 invalid chartset 的异常
        }
        else {
            res.statusCode = err.statusCode || status_code_1.StatusCode.UnknownError;
            res.statusMessage = err.name; // statusMessage 不能为中文，否则会出现 invalid chartset 的异常
            if (/^\d\d\d\s/.test(err.name)) {
                res.statusCode = Number.parseInt(err.name.substr(0, 3));
                err.name = err.name.substr(4);
            }
        }
        let outputObject = this.errorOutputObject(err);
        let str = JSON.stringify(outputObject);
        res.write(str);
        res.end();
    }
    errorOutputObject(err) {
        let outputObject = typeof err == "string" ? { message: err, name: "unknown" } : { message: err.message, name: err.name, stack: err.stack };
        if (typeof err != "string" && err.innerError) {
            outputObject['innerError'] = this.errorOutputObject(err.innerError);
        }
        return outputObject;
    }
    // /** 日志记录器 */
    // getLogger(categoryName: string) {
    //     let logSetting = this.#settings.log || {};
    //     return getLogger(categoryName, this.logLevel, logSetting.filePath);
    // }
    /** 日志等级 */
    get logLevel() {
        return this.#logSettings.level;
    }
    // get requestProcessorTypes() {
    //     return this.#requestProcessorTypes;
    // }
    loadConfigFromFile(rootDirectory) {
        const jsonConfigName = "nwsp-config.json";
        const jsConfigName = "nwsp-config.js";
        let configPath = rootDirectory.findFile(jsonConfigName);
        if (configPath) {
            let obj = require(configPath);
            return obj;
        }
        configPath = rootDirectory.findFile(jsConfigName);
        if (configPath) {
            let obj = require(configPath);
            return obj;
        }
        return null;
    }
}
exports.WebServer = WebServer;
