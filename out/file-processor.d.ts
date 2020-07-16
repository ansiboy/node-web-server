import { RequestResult } from "./request-processor";
export declare type FileProcessor = (args: {
    virtualPath: string;
    physicalPath?: string | null;
}) => RequestResult | Promise<RequestResult>;
