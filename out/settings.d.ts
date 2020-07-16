import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor } from "./request-processor";
import { RequestResultTransform } from "./content-transform";
export interface Settings {
    port?: number;
    bindIP?: string;
    requestProcessorTypes?: {
        new (config?: any): RequestProcessor;
    }[];
    requestProcessorConfigs?: {
        [key: string]: any;
    };
    websiteDirectory?: string | VirtualDirectory;
    requestResultTransforms?: RequestResultTransform[];
}
