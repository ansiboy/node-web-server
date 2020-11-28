import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
export declare type DynamicScriptFunction = (args: RequestContext) => RequestResult | Promise<RequestResult>;
export declare type DynamicRequestProcessorConfig = {
    path?: string;
};
export declare class DynamicRequestProcessor implements RequestProcessor {
    #private;
    constructor();
    /** 获取脚本路径 */
    get scriptPath(): string;
    /** 设置脚本路径 */
    set scriptPath(value: string);
    execute(args: RequestContext): RequestResult | Promise<RequestResult> | null;
}
