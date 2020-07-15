/// <reference types="node" />
import { Settings } from "./settings";
import http = require("http");
import { VirtualDirectory } from "./virtual-directory";
import { RequestProcessor } from "./request-processor";
export declare class WebServer {
    #private;
    static defaultRequestProcessorTypes: {
        new (config?: any): RequestProcessor;
    }[];
    constructor(settings: Settings);
    get root(): VirtualDirectory;
    get port(): number;
    get requestProcessors(): RequestProcessor[];
    get source(): http.Server;
    private start;
    private outputContent;
    private outputError;
    private errorOutputObject;
}
