import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor } from "./request-processor";
import { RequestResultTransform } from "./content-transform";
import { LogLevel } from "./logger";

export interface Settings {
    port?: number,
    bindIP?: string,
    // requestProcessors?: RequestProcessor[],
    logLevel?: LogLevel,
    requestProcessorTypes?: { new(config?: any): RequestProcessor }[],
    requestProcessorConfigs?: { [key: string]: any },
    websiteDirectory?: string | VirtualDirectory,
    requestResultTransforms?: RequestResultTransform[]
}