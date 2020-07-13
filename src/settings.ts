import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor } from "./request-processor";
import { ContentTransform } from "./content-transform";

export interface Settings {
    port?: number,
    bindIP?: string,
    // requestProcessors?: RequestProcessor[],
    requestProcessorTypes?: { new(config?: any): RequestProcessor }[],
    requestProcessorConfigs?: { [key: string]: any },
    root?: string | VirtualDirectory,
    contentTransforms?: ContentTransform[]
}