import { RequestProcessor } from "./request-processor";
import { ContentTransform } from "./content-transform";
export interface Settings {
    port?: number;
    bindIP?: string;
    requestProcessorTypes?: {
        new (config?: any): RequestProcessor;
    }[];
    requestProcessorConfigs?: {
        [key: string]: any;
    };
    websitePhysicalPath?: string;
    contentTransforms?: ContentTransform[];
}
