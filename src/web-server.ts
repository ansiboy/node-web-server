import { Settings, UrlRewriteFunc, UrlRewriteItem } from "./settings";
import http = require("http");
import https = require("https");
import net = require("net");
import { AddressInfo } from "net";
import { errors } from "./errors";
import { VirtualDirectory } from "./virtual-directory";
import { RequestResult, Content, RequestContext, RequestProcessor } from "./request-processor";
import { defaultContentTypes } from "./content-types";
import { ContentTransformFunc, ContentTransform } from "./content-transform";
import { ProxyRequestProcessor } from "./request-processors/proxy";
import { StaticFileRequestProcessor } from "./request-processors/static-file";
import { StatusCode } from "./status-code";
import { DynamicRequestProcessor } from "./request-processors/cgi";
import * as stream from "stream";
import * as path from "path";
import { HeadersRequestProcessor } from "./request-processors/headers";
import { getLogger } from "./logger";
import { loadPlugins } from "./load-plugins";
import { Logger } from "log4js";
import { processorPriorities } from "./request-processors/priority";
import { FileRequestProcessor } from "./request-processors/file";
import { Callback } from "maishu-toolkit";
import { ungzip } from "node-gzip";

const DefaultWebSitePath = "../sample-website";
export class WebServer {

    private _websiteDirectory: VirtualDirectory;
    private _requestProcessors: WebServerRequestProcessors;
    private _settings: Settings;
    private _source: net.Server;
    private _contentTransforms: (ContentTransform | ContentTransformFunc)[] = [];
    private _defaultLogSettings: NonNullable<Required<Settings["log"]>> = {
        level: "all",
        filePath: "log.txt",
    };
    private _logSettings: NonNullable<Required<Settings["log"]>>;

    constructor(settings?: Settings) {
        settings = settings || {};

        if (settings.websiteDirectory == null) {
            this._websiteDirectory = new VirtualDirectory(path.join(__dirname, DefaultWebSitePath));
        }
        else if (typeof settings.websiteDirectory == "string") {
            this._websiteDirectory = new VirtualDirectory(settings.websiteDirectory);
        }
        else {
            this._websiteDirectory = settings.websiteDirectory;
        }


        let pkg = require("../package.json");
        let logger = getLogger(pkg.name, settings.log?.level);
        let obj = this.loadConfigFromFile(this._websiteDirectory, logger);
        if (obj) {
            Object.assign(settings, obj);
        }

        if (settings.virtualPaths) {
            for (let virtualPath in settings.virtualPaths) {
                let physicalPath = settings.virtualPaths[virtualPath];
                if (virtualPath[0] != "/")
                    virtualPath = "/" + virtualPath;

                this._websiteDirectory.setPath(virtualPath, physicalPath);
            }
        }

        this._settings = settings;
        this._logSettings = Object.assign({}, this._defaultLogSettings, settings.log || {});

        this._requestProcessors = new WebServerRequestProcessors();
        this._source = this.start();

        var processors = this._requestProcessors.items.map(o => o.processor);
        for (let i = 0; i < processors.length; i++) {
            this.setProcessorOptions(processors[i], logger)
        }

        this.requestProcessors.added.add(args => {
            this.setProcessorOptions(args.item, logger);
        })
    }

    /** 网站文件夹 */
    get websiteDirectory() {
        return this._websiteDirectory;
    }

    /** 端口 */
    get port() {
        if (this._settings.port == null) {
            let address = this._source.address() as AddressInfo;
            // TODO: address is null
            return address.port;
        }
        return this._settings.port;
    }

    /** 请求处理器实例 */
    get requestProcessors() {
        return this._requestProcessors;
    }

    get source(): net.Server {
        return this._source;
    }

    /** 内容转换器 */
    get contentTransforms() {
        return this._contentTransforms;
    }

    /** 设置 */
    get settings() {
        return this._settings;
    }

    private async requestListener(req: http.IncomingMessage, res: http.ServerResponse, settings: Settings, logger: Logger) {
        let reqUrl = req.url || "";
        let rewrite: UrlRewriteFunc | null = null;
        if (typeof settings.urlRewrite == "function") {
            rewrite = settings.urlRewrite;
        }
        else if (settings.urlRewrite != null) {
            let dic: { [url: string]: UrlRewriteItem } = {};
            Object.keys(settings.urlRewrite).forEach(k => {
                let urlRewrite = settings.urlRewrite as { [url: string]: (string | UrlRewriteItem) };
                if (typeof urlRewrite[k] == "string") {
                    dic[k] = { targetUrl: urlRewrite[k] as string };
                }
                else {
                    dic[k] = urlRewrite[k] as UrlRewriteItem;
                }
            })
            rewrite = this.createRewriteFunc(dic);
        }

        let targetURL: string | null = null;
        if (rewrite != null) {
            try {
                let r = rewrite(reqUrl, { req });
                if (typeof r == "string")
                    targetURL = r;
                else
                    targetURL = await r;
            }
            catch (err: any) {
                this.outputError(err, res);
                return;
            }
        }

        if (targetURL != null) {
            logger.info(`Path rewrite, ${reqUrl} -> ${targetURL}`);
            reqUrl = targetURL;
        }

        let requestContext = new RequestContext({
            url: reqUrl, rootDirectory: this._websiteDirectory,
            req, res, logLevel: this.logLevel
        });

        var requestProcessors = this._requestProcessors.items.sort((a, b) => a.priority > b.priority ? -1 : 1).map(o => o.processor);
        for (let i = 0; i < requestProcessors.length; i++) {
            let processor = requestProcessors[i];
            try {
                let r: RequestResult | null = null;

                let p = processor.execute(requestContext);
                if (p == null)
                    continue;

                if ((p as Promise<any>).then != null) {
                    r = await p;
                }
                else {
                    r = p as RequestResult;
                }

                if (res.getHeader("content-encoding") == "gzip" && r?.content instanceof Buffer) {
                    r.content = await ungzip(r.content);
                    res.removeHeader("content-length");
                    res.removeHeader("content-encoding");
                }

                if (r != null) {

                    if (!r.disableTransform)
                        r = await this.resultTransform(r, requestContext, this._contentTransforms);

                    if (r.statusCode) {
                        res.statusCode = r.statusCode;
                    }
                    if (r.statusMessage) {
                        res.statusMessage = r.statusMessage;
                    }
                    if (r.headers) {
                        res.getHeaderNames().forEach(n => res.removeHeader(n));
                        for (let key in r.headers) {
                            res.setHeader(key, r.headers[key] || "");
                        }
                    }

                    res.setHeader("processor", processor.constructor.name);

                    this.outputContent(r.content, requestContext);
                    return;
                }
            }
            catch (err: any) {
                this.outputError(err, res);
                return;
            }
        }

        // 404
        this.outputError(errors.pageNotFound(requestContext.url), res);
    }

    private start() {
        let settings: Settings = this._settings;


        let func = async (req: http.IncomingMessage, res: http.ServerResponse) => {
            try {
                await this.requestListener(req, res, settings, logger);
            }
            catch (err: any) {
                this.outputError(err, res);
                return;
            }
        }

        let server: net.Server;
        if (settings.https) {
            let h = settings.https;
            server = https.createServer(h, func);
        }
        else {
            server = http.createServer({}, func);
        }

        let packagePath = "../package.json";
        let pkg = require(packagePath);
        let logger = getLogger(pkg.name, settings.log?.level)
        loadPlugins(this, logger);

        var requestProcessors = this._requestProcessors.items.map(o => o.processor);
        if (settings.processors != null) {
            for (let i = 0; i < requestProcessors.length; i++) {
                let requestProcessor = requestProcessors[i];
                let name = requestProcessor.constructor.name;
                let processorProperties = settings.processors[name];
                for (let prop in processorProperties) {
                    if ((requestProcessor as any)[prop]) {
                        (requestProcessor as any)[prop] = processorProperties[prop];
                    }
                }
            }
        }

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
            if (content == null) {
                let contentType = (res.getHeader("Content-Type") || "") as string;
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

    outputError(err: Error | string, res: http.ServerResponse) {
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

    /** 日志等级 */
    get logLevel() {
        return this._logSettings.level;
    }

    private loadConfigFromFile(rootDirectory: VirtualDirectory, logger: Logger): Settings | null {
        const jsonConfigName = "nws-config.json";
        const jsConfigName = "nws-config.js";

        let r: Settings | null = null;
        let configPath = rootDirectory.findFile(jsonConfigName);
        if (configPath) {
            r = require(configPath);
            logger.info(`Config file '${configPath}' is loaded.`)
        }

        configPath = rootDirectory.findFile(jsConfigName);
        if (r == null && configPath != null) {
            let obj = require(configPath);
            logger.info(`Config file '${configPath}' is loaded.`)
            r = obj.default || obj;
        }

        // check config file
        if (r != null) {
            this.checkSettings(r, logger);
        }

        return r;

    }

    private checkSettings(settings: Settings, logger: Logger) {
        let settingsKeys: (keyof Settings)[] = [
            "port", "bindIP", "log", "websiteDirectory",
            "processors", "virtualPaths"
        ];

        let keys = Object.getOwnPropertyNames(settings) as (keyof Settings)[];
        for (let i = 0; i < keys.length; i++) {
            if (settingsKeys.indexOf(keys[i]) < 0) {
                // throw errors.notSettingsField(keys[i]);
                let err = errors.notSettingsField(keys[i]);
                logger.warn(err.message);
            }
        }
    }

    private setProcessorOptions(requestProcessor: RequestProcessor, logger: Logger, name?: string) {
        let processors = this._settings.processors || {};
        let typeName = requestProcessor.constructor.name;
        let shortName = requestProcessor.constructor.name.replace("RequestProcessor", "").replace("Processor", "");
        let alaisName = shortName + "Processor";
        let processorProperties = processors[typeName] || processors[shortName] || processors[alaisName];
        for (let prop in processorProperties) {
            if ((requestProcessor as any)[prop] !== undefined) {
                (requestProcessor as any)[prop] = processorProperties[prop];
                logger.info(`Set processor '${typeName}' property '${prop}', value is:\n`);
                logger.info(JSON.stringify(processorProperties[prop], null, "    "));
            }
        }

        let configFileName = `${shortName}.config.json`;
        let configFilePhysicalPath = this.websiteDirectory.findFile(configFileName);
        if (!configFilePhysicalPath) {
            configFileName = `${alaisName}.config.json`;
            configFilePhysicalPath = this.websiteDirectory.findFile(configFileName);
        }
    }

    private createRewriteFunc(rewriteItems: { [url: string]: UrlRewriteItem }): UrlRewriteFunc {
        let func: UrlRewriteFunc = (rawUrl, options): string | null => {
            for (let key in rewriteItems) {
                let regex = new RegExp(key);
                let arr = regex.exec(rawUrl)
                if (arr == null || arr.length == 0) {
                    continue;
                }

                let rewriteItem: UrlRewriteItem = rewriteItems[key];
                if (rewriteItem.method != null && rewriteItem.method.toUpperCase() != (options.req.method || "").toUpperCase())
                    continue;

                // let exts: string[] | null = null;
                // if (typeof rewriteItem.ext == "string")
                //     exts = [rewriteItem.ext];
                // else if (Array.isArray(rewriteItem.ext))
                //     exts = rewriteItem.ext;

                // if (exts != null && exts.indexOf(options.ext) < 0)
                //     continue;

                let targetURL = rewriteItem.targetUrl;
                let regex1 = /\$(\d+)/g;
                if (regex1.test(targetURL)) {
                    targetURL = targetURL.replace(regex1, (match, number) => {
                        if (arr == null) throw errors.unexpectedNullValue('arr')

                        return typeof arr[number] != 'undefined' ? arr[number] : match;
                    })
                }

                if (targetURL[0] != "/")
                    targetURL = "/" + targetURL;

                return targetURL;
            }

            return null;

        }

        return func;
    }
}

export class WebServerRequestProcessors {

    private headers = new HeadersRequestProcessor();
    private proxy = new ProxyRequestProcessor();
    private dynamic = new DynamicRequestProcessor();
    private static = new StaticFileRequestProcessor();
    private file = new FileRequestProcessor();

    private _items: { priority: number; name: string, processor: RequestProcessor }[] = [];

    added: Callback<{ item: RequestProcessor }> = new Callback();

    constructor() {

        const HEADERS = "headers";
        const PROXY = "proxy";
        const DYNAMIC = "dynamic";
        const STATIC = "static";
        const FILE = "file"

        this.add(HEADERS, this.headers, processorPriorities.HeadersRequestProcessor);
        this.add(PROXY, this.proxy, processorPriorities.ProxyRequestProcessor);
        this.add(DYNAMIC, this.dynamic, processorPriorities.DynamicRequestProcessor);
        this.add(FILE, this.file, processorPriorities.FileRequestProcessor);
        this.add(STATIC, this.static, processorPriorities.StaticFileRequestProcessor);
    }

    /** 
     * @param name 名称
     * @param processor 请求处理
     * @param priority 优先级，数字越小的越优先处理
     */
    add(name: string, processor: RequestProcessor, priority?: number) {
        if (priority == undefined)
            priority = processorPriorities.Default;

        let item = this._items.filter(o => o.name == name)[0];
        if (item != null)
            throw errors.requestProcessorTypeExists(name);

        item = { priority, processor, name };
        let nextItemIndex: number | null = null;
        for (let i = 0; i < this._items.length; i++) {
            let priority = this._items[i].priority;
            if (priority == null)
                break;

            if (priority > priority) {
                nextItemIndex = i;
                break;
            }
        }

        if (nextItemIndex != null) {
            this._items.splice(nextItemIndex, 0, item);
        }
        else {
            this._items.push(item);
        }

        this.added.fire({ item: processor });
    }

    remvoe(name: string) {
        let item = this._items.filter(o => o.name)[0];
        if (!item)
            throw errors.requestProcessorTypeNotExists(name);

        this._items = this._items.filter(o => o.name != name);
    }

    get headersProcessor() {
        return this.headers;
    }

    get proxyProcessor() {
        return this.proxy;
    }

    get dynamicProcessor() {
        return this.dynamic;
    }

    get fileProcessor() {
        return this.file;
    }

    get staticProcessor() {
        return this.static;
    }

    get items() {
        return this._items;
    }

    find<T extends RequestProcessor>(name: string): T {
        let item = this._items.filter(o => o.name == name)[0];
        return item?.processor as T;
    }

}
