import { FileProcessors } from "./file-processor";
import { VirtualDirectory } from "./virtual-directory";

export interface Settings {
    port?: number,
    bindIP?: string,
    fileProcessors?: FileProcessors,
    root?: VirtualDirectory,
}