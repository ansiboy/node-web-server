import { FileProcessors } from "./file-processor";
import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor } from "./request-processor";

export interface Settings {
    port?: number,
    bindIP?: string,
    // fileProcessors?: FileProcessors,
    requestProcessors?: RequestProcessor[],
    root?: VirtualDirectory,
}