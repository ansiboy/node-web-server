import { VirtualDirectory } from "./virtual-directory";
import { LogLevel } from "./logger";
import { IncomingMessage } from "http";

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
    https?: {
        /** Private keys in PEM format. */
        key: string,
        /** PEM formatted CRLs (Certificate Revocation Lists). */
        cert: string
    }
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