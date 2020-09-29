"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const errors_1 = require("../errors");
const defaultDynamicPath = "/dynamic";
let noDefaultExport = (name) => {
    let error = { message: `Module "${name}" has not a default export.`, name: "noDefaultExport" };
    return error;
};
let defaultExportNotFunction = (name) => {
    let error = { message: `Default export of module '${name}' is not a function.`, name: "defaultExportNotFunction" };
    return error;
};
class DynamicRequestProcessor {
    constructor(config) {
        config = config || {};
        this.#dynamicScriptPath = config.path || defaultDynamicPath;
        if (!this.#dynamicScriptPath.startsWith("/"))
            this.#dynamicScriptPath = "/" + this.#dynamicScriptPath;
    }
    #dynamicScriptPath;
    execute(args) {
        if (args.virtualPath.startsWith(this.#dynamicScriptPath) == false)
            return null;
        let physicalPath = args.rootDirectory.findFile(args.virtualPath);
        if (physicalPath == null) {
            throw errors_1.errors.pageNotFound(args.virtualPath);
        }
        if (!fs.existsSync(physicalPath)) {
            throw errors_1.errors.physicalPathNotExists(physicalPath);
        }
        if (physicalPath.endsWith(".js") == false)
            physicalPath = physicalPath + ".js";
        let cgiModule = require(physicalPath);
        let func = cgiModule["default"];
        if (func == null)
            throw noDefaultExport(physicalPath);
        if (typeof func != "function")
            throw defaultExportNotFunction(physicalPath);
        let r = func(args);
        return r;
    }
}
exports.DynamicRequestProcessor = DynamicRequestProcessor;
