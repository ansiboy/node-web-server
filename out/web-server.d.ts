import { Settings } from "./settings";
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
    private start;
    private outputContent;
    private outputError;
    private errorOutputObject;
}
