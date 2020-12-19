import { RequestContext, RequestProcessor } from "..";
import { processorPriorities } from "./priority";

export type Headers = { [name: string]: string | string[] };
export class HeadersRequestProcessor implements RequestProcessor {

    #headers: Headers = {};

    priority = processorPriorities.HeadersRequestProcessor;

    constructor() {
    }

    get headers(): Headers {
        return this.#headers;
    }
    set headers(value: Headers) {
        this.#headers = value;
    }

    execute(ctx: RequestContext): null {
        if (this.#headers) {
            for (let name in this.#headers) {
                ctx.res.setHeader(name, this.#headers[name]);
            }
        }
        return null
    }

}