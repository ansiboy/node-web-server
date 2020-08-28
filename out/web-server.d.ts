/// <reference types="node" />
import { Settings } from "./settings";
import http = require("http");
import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor } from "./request-processor";
import { RequestResultTransform } from "./content-transform";
import { LogLevel } from "./logger";
export declare class WebServer {
    #private;
    static defaultRequestProcessorTypes: {
        new (config?: any): RequestProcessor;
    }[];
    constructor(settings?: Settings);
    /** 网站文件夹 */
    get websiteDirectory(): VirtualDirectory;
    /** 端口 */
    get port(): number;
    /** 请求处理器实例 */
    get requestProcessors(): RequestProcessor[];
    get source(): http.Server;
    /** 内容转换器 */
    get contentTransforms(): RequestResultTransform[];
    private start;
    private resultTransform;
    private outputContent;
    private outputError;
    private errorOutputObject;
    /** 日志记录器 */
    getLogger(categoryName: string): import("log4js").Logger;
    /** 日志等级 */
    get logLevel(): LogLevel;
}
