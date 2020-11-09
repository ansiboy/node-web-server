"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _config;
Object.defineProperty(exports, "__esModule", { value: true });
class HeadersRequestProcessor {
    constructor(config) {
        _config.set(this, void 0);
        __classPrivateFieldSet(this, _config, config || {});
    }
    execute(ctx) {
        if (__classPrivateFieldGet(this, _config).headers) {
            for (let name in __classPrivateFieldGet(this, _config).headers) {
                ctx.res.setHeader(name, __classPrivateFieldGet(this, _config).headers[name]);
            }
        }
        return null;
    }
}
exports.HeadersRequestProcessor = HeadersRequestProcessor;
_config = new WeakMap();
