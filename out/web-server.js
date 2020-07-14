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
class WebServer {
    constructor(settings) {
        if (settings == null)
            throw errors_1.errors.argumentNull("settings");
        if (settings.root == null) {
            this.#root = new virtual_directory_1.VirtualDirectory(__dirname);
        }
        else if (typeof settings.root == "string") {
            this.#root = new virtual_directory_1.VirtualDirectory(settings.root);
        }
        else {
            this.#root = settings.root;
        }
        this.#settings = settings;
        let s = this.start(settings);
        if (!settings.port) {
            let address = s.address();
            settings.port = address.port;
        }
        let configs = this.#settings.requestProcessorConfigs || {};
        let types = this.#settings.requestProcessorTypes || WebServer.defaultRequestProcessorTypes;
        this.#requestProcessors = types.map((type) => {
            let name = type.name;
            let alias = name.endsWith("RequestProcessor") ? name.substring(0, name.length - "RequestProcessor".length) : name;
            let config = configs[name] || configs[alias] || {};
            let processor = new type(config);
            return processor;
        });
    }
    #root;
    #requestProcessors;
    #settings;
    get root() {
        return this.#root;
    }
    get port() {
        return this.#settings.port;
    }
    get requestProcessors() {
        return this.#requestProcessors;
    }
    start(settings) {
        let server = http.createServer(async (req, res) => {
            let u = url.parse(req.url || "");
            let path = u.pathname || "";
            let physicalPath = null;
            if (path.indexOf(".") < 0) {
                let dir = this.#root.findDirectory(path);
                physicalPath = dir?.physicalPath;
            }
            else {
                physicalPath = this.#root.findFile(path);
            }
            for (let i = 0; i < this.#requestProcessors.length; i++) {
                let processor = this.#requestProcessors[i];
                try {
                    let r = null;
                    let requestContext = { virtualPath: path, physicalPath, req, res };
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
                        if (r.statusCode) {
                            res.statusCode = r.statusCode;
                        }
                        if (r.contentType) {
                            res.setHeader("content-type", r.contentType);
                        }
                        if (r.headers) {
                            for (let key in r.headers) {
                                res.setHeader(key, r.headers[key]);
                            }
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
        });
        return server.listen(settings.port, settings.bindIP);
    }
    async outputContent(content, requestContext, contentTransforms) {
        for (let i = 0; i < contentTransforms.length; i++) {
            let transform = contentTransforms[i];
            console.assert(transform != null);
            let r = contentTransforms[i](content);
            if (r == null)
                throw errors_1.errors.contentTransformResultNull();
            if (r.then != null)
                content = await r;
            else
                content = r;
        }
        let res = requestContext.res;
        res.write(content);
        res.end();
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
}
exports.WebServer = WebServer;
WebServer.defaultRequestProcessorTypes = [proxy_1.ProxyRequestProcessor, static_file_1.StaticFileRequestProcessor];
