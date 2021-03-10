import { RequestContext, RequestProcessor } from "..";
import { RequestResult } from "../request-processor";
import { processorPriorities } from "./priority";

export type Headers = { [name: string]: string | string[] };
interface Options {
    headers: Headers
}
export class HeadersRequestProcessor implements RequestProcessor {

    private options: Options = { headers: {} };

    priority = processorPriorities.HeadersRequestProcessor;

    constructor() {
    }

    get headers(): Headers {
        return this.options.headers;
    }
    set headers(value: Headers) {
        this.options.headers = value;
    }

    execute(ctx: RequestContext): RequestResult | null {
        if (this.headers) {
            for (let name in this.headers) {
                ctx.res.setHeader(name, this.headers[name]);
            }
        }

        if (ctx.req.method == "OPTIONS") {
            return { content: JSON.stringify({}) };
        }

        return null
    }

}