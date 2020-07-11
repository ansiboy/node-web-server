import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor } from "./request-processor";
import { ContentTransform } from "./content-transform";

export interface Settings {
    port?: number,
    bindIP?: string,
    requestProcessors?: RequestProcessor[],
    root?: VirtualDirectory,
    contentTransforms?: ContentTransform[]
}