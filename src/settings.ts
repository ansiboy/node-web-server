import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor } from "./request-processor";
import { RequestResultTransform } from "./content-transform";
import { LogLevel } from "./logger";

export interface Settings {
    /** 服务端口 */
    port?: number,
    /** 绑定的 IP 地址，客户端只能通过绑定的 IP 进行连接，为空即所有可用 IP */
    bindIP?: string,
    /** 日志 */
    log?: {
        /** 日志等级 */
        level?: LogLevel
    },
    /** 请求处理器类型 */
    requestProcessorTypes?: { new(config?: any): RequestProcessor }[],
    /** 请求处理器配置 */
    requestProcessorConfigs?: { [key: string]: any },
    /** 网站文件夹 */
    websiteDirectory?: string | VirtualDirectory,
    /** 请求结果转换器 */
    requestResultTransforms?: RequestResultTransform[]
}