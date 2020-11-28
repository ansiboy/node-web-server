"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HeadersRequestProcessor {
    constructor() {
    }
    #headers;
    get headers() {
        return this.#headers;
    }
    set headers(value) {
        this.#headers = value;
    }
    execute(ctx) {
        if (this.#headers) {
            for (let name in this.#headers) {
                ctx.res.setHeader(name, this.#headers[name]);
            }
        }
        return null;
    }
}
exports.HeadersRequestProcessor = HeadersRequestProcessor;
