import { Settings } from "./settings";
import http = require("http");
import { AddressInfo } from "net";
import url = require("url");
import { errors } from "./errors";
import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor, ExecuteResult, Content, RequestContext } from "./request-processor";
import { contentTypes } from "./content-types";
import { ContentTransform } from "./content-transform";
import { ProxyRequestProcessor } from "./request-processors/proxy";
import { StaticFileRequestProcessor } from "./request-processors/static-file";
import { StatusCode } from "./status-code";
import { CGIRequestProcessor } from "./request-processors/cgi";

export class WebServer {

    #websiteDirectory: VirtualDirectory;
    #requestProcessors: RequestProcessor[];
    #settings: Settings;
    #source: http.Server;
    #contentTransforms: ContentTransform[]

    static defaultRequestProcessorTypes: { new(config?: any): RequestProcessor }[] = [
        ProxyRequestProcessor, CGIRequestProcessor, StaticFileRequestProcessor
    ];

    constructor(settings: Settings) {
        if (settings == null) throw errors.argumentNull("settings");
        if (settings.websiteDirectory == null) {
            this.#websiteDirectory = new VirtualDirectory(__dirname);
        }
        else if (typeof settings.websiteDirectory == "string") {
            this.#websiteDirectory = new VirtualDirectory(settings.websiteDirectory);
        }
        else {
            this.#websiteDirectory = settings.websiteDirectory;
        }


        this.#settings = settings;
        this.#source = this.start(settings);
        if (!settings.port) {
            let address = this.#source.address() as AddressInfo;
            settings.port = address.port;
        }

        let configs = this.#settings.requestProcessorConfigs || {};
        let types = this.#settings.requestProcessorTypes || WebServer.defaultRequestProcessorTypes;
        this.#requestProcessors = types.map((type: any) => {
            let name = type.name;
            let alias = name.endsWith("RequestProcessor") ? name.substring(0, name.length - "RequestProcessor".length) : name;
            let config = configs[name] || configs[alias] || {};
            let processor = new type(config);
            return processor;
        });
        this.#contentTransforms = settings.contentTransforms || [];
    }

    get websiteDirectory() {
        return this.#websiteDirectory;
    }

    get port() {
        return this.#settings.port as number;
    }

    get requestProcessors() {
        return this.#requestProcessors;
    }

    get source() {
        return this.#source;
    }

    get contentTransforms() {
        return this.#contentTransforms;
    }

    private start(settings: Settings) {
        let server = http.createServer(async (req, res) => {
            let u = url.parse(req.url || "");

            let path = u.pathname || "";
            let physicalPath: string | null | undefined = null;
            if (path.indexOf(".") < 0) {
                let dir = this.#websiteDirectory.findDirectory(path);
                physicalPath = dir?.physicalPath;
            }
            else {
                physicalPath = this.#websiteDirectory.findFile(path);
            }

            for (let i = 0; i < this.#requestProcessors.length; i++) {
                let processor = this.#requestProcessors[i];
                try {
                    let r: ExecuteResult | null = null;
                    let requestContext = { virtualPath: path, physicalPath, req, res };
                    let p = processor.execute(requestContext);
                    if (p == null)
                        continue;

                    if ((p as Promise<any>).then != null) {
                        r = await p;
                    }
                    else {
                        r = p as ExecuteResult;
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

                        this.outputContent(r.content, requestContext, this.#contentTransforms);
                        return;
                    }
                }
                catch (err) {
                    this.outputError(err, res);
                    return;
                }
            }

            // 404
            this.outputError(errors.pageNotFound(path), res);
        })

        return server.listen(settings.port, settings.bindIP);
    }

    private async outputContent(content: Content, requestContext: RequestContext, contentTransforms: ContentTransform[]) {
        for (let i = 0; i < contentTransforms.length; i++) {
            let transform = contentTransforms[i];
            console.assert(transform != null);
            let r = contentTransforms[i](content, requestContext);
            if (r == null)
                throw errors.contentTransformResultNull();

            if ((r as Promise<any>).then != null)
                content = await r;
            else
                content = r as Content;
        }

        let res = requestContext.res;
        res.write(content);
        res.end();
    }


    private outputError(err: Error, res: http.ServerResponse) {
        if (err == null) {
            err = new Error(`Unkonwn error because original error is null.`)
            err.name = 'nullError'
        }

        // const defaultErrorStatusCode = 600;

        res.setHeader("content-type", contentTypes.json);
        res.statusCode = err.statusCode || StatusCode.UnknownError;
        res.statusMessage = err.name;      // statusMessage 不能为中文，否则会出现 invalid chartset 的异常

        if (/^\d\d\d\s/.test(err.name)) {
            res.statusCode = Number.parseInt(err.name.substr(0, 3));
            err.name = err.name.substr(4);
        }

        let outputObject = this.errorOutputObject(err)
        let str = JSON.stringify(outputObject);
        res.write(str);
        res.end();
    }

    private errorOutputObject(err: Error) {
        let outputObject = { message: err.message, name: err.name, stack: err.stack };
        if (err.innerError) {
            (outputObject as any)['innerError'] = this.errorOutputObject(err.innerError)
        }

        return outputObject
    }


}