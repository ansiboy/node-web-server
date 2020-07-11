"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_file_1 = require("./static-file");
const proxy_1 = require("./proxy");
exports.requestProcessors = {
    static: new static_file_1.StaticFileRequestProcessor(),
    proxy: new proxy_1.ProxyRequestProcessor(),
};
//# sourceMappingURL=index.js.map