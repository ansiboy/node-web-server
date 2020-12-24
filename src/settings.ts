import { VirtualDirectory } from "./virtual-directory";
import { LogLevel } from "./logger";

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
    /** 网站文件夹 */
    websiteDirectory?: string | VirtualDirectory,
    /** 请求处理选项配置 */
    processors?: { [name: string]: any },
    virtualPaths?: { [virtualPath: string]: string },
}