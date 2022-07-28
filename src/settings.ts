import { VirtualDirectory } from "./virtual-directory";
import { LogLevel } from "./logger";
import { IncomingMessage } from "http";
import { ServerOptions } from "https";

export interface Settings {
    /** 服务端口 */
    port?: number,
    /** 绑定的 IP 地址，客户端只能通过绑定的 IP 进行连接，为空即所有可用 IP */
    bindIP?: string,
    /** 日志 */
    log?: {
        /** 日志等级 */
        level?: LogLevel,
        filePath?: string,
    },
    /** 网站文件夹，使用绝对路径或者 VirtualDirectory 对象 */
    websiteDirectory?: string | VirtualDirectory,
    /** 请求处理选项配置 */
    processors?: { [name: string]: any },
    virtualPaths?: { [virtualPath: string]: string },
    urlRewrite?: { [url: string]: (string | UrlRewriteItem) } | UrlRewriteFunc,
    https?: ServerOptions
}

export type UrlRewriteOptions = {
    req: IncomingMessage
}
export type UrlRewriteFunc = (rawUrl: string, options: UrlRewriteOptions) => string | null | Promise<string | null>;

export interface UrlRewriteItem {
    targetUrl: string,
    method?: string,
    /** 路径的扩展名 */
    ext?: string | string[],
}