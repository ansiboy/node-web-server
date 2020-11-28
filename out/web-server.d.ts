/// <reference types="node" />
import { Settings } from "./settings";
import http = require("http");
import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor, RequestProcessorType } from "./request-processor";
import { ContentTransformFunc, ContentTransform } from "./content-transform";
import { LogLevel } from "./logger";
export declare class WebServer {
    #private;
    constructor(settings?: Settings);
    /** 网站文件夹 */
    get websiteDirectory(): VirtualDirectory;
    /** 端口 */
    get port(): number;
    /** 请求处理器实例 */
    get requestProcessors(): RequestProcessor[];
    get source(): http.Server;
    /** 内容转换器 */
    get contentTransforms(): (ContentTransform | ContentTransformFunc)[];
    private start;
    private resultTransform;
    private outputContent;
    private outputError;
    private errorOutputObject;
    /** 日志记录器 */
    getLogger(categoryName: string): import("log4js").Logger;
    /** 日志等级 */
    get logLevel(): LogLevel;
    get requestProcessorTypes(): RequestProcessorType[];
}
