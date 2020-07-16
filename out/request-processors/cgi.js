"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const errors_1 = require("../errors");
const cgiPath = "/cgi-bin";
let noDefaultExport = (name) => {
    let error = { message: `Module "${name}" has not a default export.`, name: "noDefaultExport" };
    return error;
};
let defaultExportNotFunction = (name) => {
    let error = { message: `Default export of module '${name}' is not a function.`, name: "defaultExportNotFunction" };
    return error;
};
class CGIRequestProcessor {
    execute(args) {
        if (args.virtualPath.startsWith(cgiPath) == false)
            return null;
        if (args.physicalPath == null || !fs.existsSync(args.physicalPath)) {
            throw errors_1.errors.pageNotFound(args.physicalPath || args.virtualPath);
        }
        if (args.physicalPath.endsWith(".js") == false)
            args.physicalPath = args.physicalPath + ".js";
        let cgiModule = require(args.physicalPath);
        let func = cgiModule["default"];
        if (func == null)
            throw noDefaultExport(args.physicalPath);
        if (typeof func != "function")
            throw defaultExportNotFunction(args.physicalPath);
        let r = func(args);
        return r;
    }
}
exports.CGIRequestProcessor = CGIRequestProcessor;
