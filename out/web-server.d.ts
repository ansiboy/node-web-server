import { Settings } from "./settings";
import { VirtualDirectory } from "./virtual-directory";
export declare class WebServer {
    #private;
    constructor(settings: Settings);
    get root(): VirtualDirectory;
    get port(): number;
    get requestProcessors(): {
        static: import("./request-processors/static-file").StaticFileRequestProcessor;
        proxy: import("./request-processors/proxy").ProxyRequestProcessor;
    };
    private start;
    private outputContent;
    private outputError;
    private errorOutputObject;
}
