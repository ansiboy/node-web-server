/// <reference types="node" />
import { Settings } from "./settings";
import http = require("http");
import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor } from "./request-processor";
import { RequestResultTransform } from "./content-transform";
export declare class WebServer {
    #private;
    static defaultRequestProcessorTypes: {
        new (config?: any): RequestProcessor;
    }[];
    constructor(settings: Settings);
    get websiteDirectory(): VirtualDirectory;
    get port(): number;
    get requestProcessors(): RequestProcessor[];
    get source(): http.Server;
    get contentTransforms(): RequestResultTransform[];
    private start;
    private resultTransform;
    private outputContent;
    private outputError;
    private errorOutputObject;
}
