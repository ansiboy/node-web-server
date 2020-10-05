import { RequestContext, RequestProcessor, RequestResult } from "..";

export interface HeadersRequestProcessorConfig {
    headers?: { [name: string]: string | string[] },
}

export class HeadersRequestProcessor implements RequestProcessor {

    #config: HeadersRequestProcessorConfig;

    constructor(config?: HeadersRequestProcessorConfig) {
        this.#config = config || {};
    }

    execute(ctx: RequestContext): null {
        if (this.#config.headers) {
            for (let name in this.#config.headers) {
                ctx.res.setHeader(name, this.#config.headers[name]);
            }
        }
        return null
    }

}