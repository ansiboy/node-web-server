import { StaticFileRequestProcessor } from "./static-file";
import { ProxyRequestProcessor } from "./proxy";
export declare let requestProcessors: {
    static: StaticFileRequestProcessor;
    proxy: ProxyRequestProcessor;
};
