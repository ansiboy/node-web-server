import { RequestContext, RequestProcessor } from "..";

export interface HeadersRequestProcessorConfig {
    headers?: { [name: string]: string | string[] },
}

export class HeadersRequestProcessor implements RequestProcessor {

    #headers?: { [name: string]: string | string[] };

    constructor() {
    }

    get headers() {
        return this.#headers;
    }
    set headers(value) {
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