import { Settings } from "./settings";
import { VirtualDirectory } from "./virtual-directory";
import { ProxyRequestProcessor } from "./request-processors/proxy";
import { StaticFileRequestProcessor } from "./request-processors/static-file";
export declare class WebServer {
    #private;
    constructor(settings: Settings);
    get root(): VirtualDirectory;
    get port(): number;
    get requestProcessors(): {
        static: StaticFileRequestProcessor;
        proxy: ProxyRequestProcessor;
    };
    private start;
    private outputContent;
    private outputError;
    private errorOutputObject;
}
