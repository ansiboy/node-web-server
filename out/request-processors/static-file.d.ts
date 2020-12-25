import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
export declare class StaticFileRequestProcessor implements RequestProcessor {
    #private;
    priority: number;
    constructor();
    get contentTypes(): {
        [key: string]: string;
    };
    set contentTypes(value: {
        [key: string]: string;
    });
    /** 获取静态文件夹路径 */
    get staticPath(): string | null;
    /** 设置静态文件夹路径 */
    set staticPath(value: string | null);
    execute(ctx: RequestContext): Promise<RequestResult | null>;
    private processStaticFile;
}
