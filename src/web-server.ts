import { Settings } from "./settings";
import http = require("http");
import url = require("url");
import { AddressInfo } from "net";
import { errors } from "./errors";
import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor, RequestResult, Content, RequestContext } from "./request-processor";
import { contentTypes } from "./content-types";
import { RequestResultTransform } from "./content-transform";
import { ProxyRequestProcessor } from "./request-processors/proxy";
import { StaticFileRequestProcessor } from "./request-processors/static-file";
import { StatusCode } from "./status-code";
import { CGIRequestProcessor } from "./request-processors/cgi";
import { getLogger, LogLevel } from "./logger";
import * as stream from "stream";
import * as path from "path";

const DefaultWebSitePath = "../sample-website";
export class WebServer {

    #websiteDirectory: VirtualDirectory;
    #requestProcessors: RequestProcessor[];
    #settings: Settings;
    #source: http.Server;
    #requestResultTransforms: RequestResultTransform[];
    #defaultLogSettings: NonNullable<Required<Settings["log"]>> = {
        level: "all",
        filePath: "log.txt",
    };
    #logSettings: NonNullable<Required<Settings["log"]>>;

    static defaultRequestProcessorTypes: { new(config?: any): RequestProcessor }[] = [
        ProxyRequestProcessor, CGIRequestProcessor, StaticFileRequestProcessor
    ];

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
        // if (!settings.port) {
        //     let address = this.#source.address() as AddressInfo;
        //     settings.port = address.port;
        // }

        let configs = this.#settings.requestProcessorConfigs || {};
        let types = this.#settings.requestProcessorTypes || WebServer.defaultRequestProcessorTypes;
        this.#requestProcessors = types.map((type: any) => {
            let name = type.name;
            let alias = name.endsWith("RequestProcessor") ? name.substring(0, name.length - "RequestProcessor".length) : name;
            let config = configs[name] || configs[alias] || {};
            let processor = new type(config);
            return processor;
        });
        this.#requestResultTransforms = settings.requestResultTransforms || [];
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
        return this.#settings.port as number;
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
        return this.#requestResultTransforms;
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
                        r = await this.resultTransform(r, requestContext, this.#requestResultTransforms);
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

    private async resultTransform(result: RequestResult, requestContext: RequestContext, requestResultTransforms: RequestResultTransform[]) {
        for (let i = 0; i < requestResultTransforms.length; i++) {
            let transform = requestResultTransforms[i];
            console.assert(transform != null);
            let r = requestResultTransforms[i](result, requestContext);
            if (r == null)
                throw errors.contentTransformResultNull();

            if ((r as Promise<any>).then != null)
                result = await r;
            else
                result = r as RequestResult;
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

    /** 日志记录器 */
    getLogger(categoryName: string) {
        let logSetting = this.#settings.log || {};
        return getLogger(categoryName, this.logLevel, logSetting.filePath);
    }

    /** 日志等级 */
    get logLevel() {
        return this.#logSettings.level;
    }

}