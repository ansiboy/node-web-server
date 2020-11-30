import { Settings } from "./settings";
import http = require("http");
import url = require("url");
import { AddressInfo } from "net";
import { errors } from "./errors";
import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor, RequestResult, Content, RequestContext } from "./request-processor";
import { defaultContentTypes } from "./content-types";
import { ContentTransformFunc, ContentTransform } from "./content-transform";
import { ProxyRequestProcessor } from "./request-processors/proxy";
import { StaticFileRequestProcessor } from "./request-processors/static-file";
import { StatusCode } from "./status-code";
import { DynamicRequestProcessor } from "./request-processors/cgi";
import * as stream from "stream";
import * as path from "path";
import { HeadersRequestProcessor } from "./request-processors/headers";

const DefaultWebSitePath = "../sample-website";
export class WebServer {

    #websiteDirectory: VirtualDirectory;
    #requestProcessors: RequestProcessor[];
    #settings: Settings;
    #source: http.Server;
    #contentTransforms: (ContentTransform | ContentTransformFunc)[] = [];
    #defaultLogSettings: NonNullable<Required<Settings["log"]>> = {
        level: "all",
        filePath: "log.txt",
    };
    #logSettings: NonNullable<Required<Settings["log"]>>;
    // #requestProcessorTypes: RequestProcessorType[] = [];

    #defaultRequestProcessors = {
        headers: new HeadersRequestProcessor(), proxy: new ProxyRequestProcessor(),
        dynamic: new DynamicRequestProcessor(), static: new StaticFileRequestProcessor(),
    };

    constructor(settings?: Settings) {
        settings = settings || {};
        if (settings == null) throw errors.argumentNull("settings");
        if (settings.websiteDirectory == null) {
            this.#websiteDirectory = new VirtualDirectory(path.join(__dirname, DefaultWebSitePath));
        }
        else if (typeof settings.websiteDirectory == "string") {
            this.#websiteDirectory = new VirtualDirectory(settings.websiteDirectory);
        }
        else {
            this.#websiteDirectory = settings.websiteDirectory;
        }


        this.#settings = settings;
        this.#logSettings = Object.assign(settings.log || {}, this.#defaultLogSettings);
        this.#source = this.start();
        this.#requestProcessors = [
            this.#defaultRequestProcessors.headers, this.#defaultRequestProcessors.proxy,
            this.#defaultRequestProcessors.dynamic, this.#defaultRequestProcessors.static,
        ];

    }

    /** 网站文件夹 */
    get websiteDirectory() {
        return this.#websiteDirectory;
    }

    /** 端口 */
    get port() {
        if (this.#settings.port == null) {
            let address = this.#source.address() as AddressInfo;
            // TODO: address is null
            return address.port;
        }
        return this.#settings.port;
    }

    /** 请求处理器实例 */
    get requestProcessors() {
        return this.#requestProcessors;
    }

    get source(): http.Server {
        return this.#source;
    }

    /** 内容转换器 */
    get contentTransforms() {
        return this.#contentTransforms;
    }

    private start() {
        let settings: Settings = this.#settings;
        let server = http.createServer(async (req, res) => {
            let u = url.parse(req.url || "");

            let path = u.pathname || "";

            for (let i = 0; i < this.#requestProcessors.length; i++) {
                let processor = this.#requestProcessors[i];
                try {
                    let r: RequestResult | null = null;
                    let requestContext: RequestContext = {
                        virtualPath: path, rootDirectory: this.#websiteDirectory,
                        req, res, logLevel: this.logLevel
                    };
                    let p = processor.execute(requestContext);
                    if (p == null)
                        continue;

                    if ((p as Promise<any>).then != null) {
                        r = await p;
                    }
                    else {
                        r = p as RequestResult;
                    }

                    if (r != null) {
                        r = await this.resultTransform(r, requestContext, this.#contentTransforms);
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
            this.outputError(errors.pageNotFound(path), res);
        })

        return server.listen(settings.port, settings.bindIP);
    }

    private async resultTransform(result: RequestResult, requestContext: RequestContext, requestResultTransforms: (ContentTransformFunc | ContentTransform)[]) {
        for (let i = 0; i < requestResultTransforms.length; i++) {
            let transform = requestResultTransforms[i];
            console.assert(transform != null);
            let r = typeof transform == "function" ? transform(result, requestContext) : transform.execute(result, requestContext);
            if (r == null)
                throw errors.contentTransformResultNull();

            if ((r as Promise<any>).then != null)
                result = await r;
            else
                result = r as RequestResult;

            if (result == null)
                throw errors.contentTransformResultNull();
        }

        return result;
    }

    private async outputContent(content: Content, requestContext: RequestContext) {
        let res = requestContext.res;
        if (content instanceof stream.Readable) {
            content.pipe(res)
        }
        else {
            res.write(content);
            res.end();
        }
    }

    private outputError(err: Error | string, res: http.ServerResponse) {
        if (err == null) {
            err = new Error(`Unkonwn error because original error is null.`)
            err.name = 'nullError'
        }

        res.setHeader("content-type", defaultContentTypes[".json"]);
        if (typeof err == "string") {
            res.statusCode = StatusCode.UnknownError;
            res.statusMessage = err;      // statusMessage 不能为中文，否则会出现 invalid chartset 的异常

        }
        else {
            res.statusCode = err.statusCode || StatusCode.UnknownError;
            res.statusMessage = err.name;      // statusMessage 不能为中文，否则会出现 invalid chartset 的异常

            if (/^\d\d\d\s/.test(err.name)) {
                res.statusCode = Number.parseInt(err.name.substr(0, 3));
                err.name = err.name.substr(4);
            }
        }


        let outputObject = this.errorOutputObject(err)
        let str = JSON.stringify(outputObject);
        res.write(str);
        res.end();
    }

    private errorOutputObject(err: Error | string) {
        let outputObject = typeof err == "string" ? { message: err, name: "unknown" } : { message: err.message, name: err.name, stack: err.stack };
        if (typeof err != "string" && err.innerError) {
            (outputObject as any)['innerError'] = this.errorOutputObject(err.innerError)
        }

        return outputObject
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

}