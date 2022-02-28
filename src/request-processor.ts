import * as http from "http";
import { LogLevel } from "./logger";
import * as stream from "stream";
import { VirtualDirectory } from "./virtual-directory";
import * as url from "url";
import { errors } from "./errors";

export type Content = string | Buffer | stream.Readable;

export class RequestContext {

    private _virtualPath: string;
    private _url: string;

    constructor(args: {
        url: string, rootDirectory: VirtualDirectory,
        req: http.IncomingMessage, res: http.ServerResponse,
        logLevel: LogLevel
    }) {

        this.url = args.url;
        this.rootDirectory = args.rootDirectory;
        this.req = args.req;
        this.res = args.res;
        this.logLevel = args.logLevel;

    }

    /** 站点根目录 */
    rootDirectory: VirtualDirectory;
    res: http.ServerResponse;
    req: http.IncomingMessage;
    logLevel: LogLevel;
    get virtualPath(): string {
        return this._virtualPath;
    }
    get url(): string {
        return this._url;
    }
    set url(value: string) {
        if (!value) throw errors.argumentNull("value");

        this._url = value;
        let u = url.parse(value);
        this._virtualPath = u.pathname || "";
    }
}

export type RequestResult = {
    statusCode?: number,
    statusMessage?: string,
    content: Content,
    headers?: { [key: string]: string | string[] | undefined },

    /** 禁止转换，设置为 true 后，将不对 content 进行转换 */
    disableTransform?: boolean,
}

export interface RequestProcessor {
    /** 优先级别，数字越小越优先执行 */
    // priority?: number;
    execute(ctx: RequestContext): RequestResult | Promise<RequestResult | null> | null;
}
export type RequestProcessorType = { new(config?: any): RequestProcessor };