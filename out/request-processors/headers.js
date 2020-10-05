"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HeadersRequestProcessor {
    constructor(config) {
        this.#config = config || {};
    }
    #config;
    execute(ctx) {
        if (this.#config.headers) {
            for (let name in this.#config.headers) {
                ctx.res.setHeader(name, this.#config.headers[name]);
            }
        }
        return null;
    }
}
exports.HeadersRequestProcessor = HeadersRequestProcessor;
