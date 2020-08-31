import { RequestResult } from "./request-processor";
export declare type FileProcessor = (args: {
    virtualPath: string;
    physicalPath: string;
}) => RequestResult | Promise<RequestResult>;
