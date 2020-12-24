"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const errors_1 = require("../errors");
const priority_1 = require("./priority");
const fs_1 = require("fs");
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
    constructor() {
        this.priority = priority_1.processorPriorities.DynamicRequestProcessor;
        this.watches = {};
        console.assert(defaultDynamicPath.startsWith("/"));
        this.#dynamicScriptPath = defaultDynamicPath;
    }
    #dynamicScriptPath;
    watchFile(physicalPath) {
        if (this.watches[physicalPath]) {
            return;
        }
        this.watches[physicalPath] = physicalPath;
        fs_1.watch(physicalPath).on("change", (eventType, file) => {
            delete require.cache[require.resolve(physicalPath)];
        });
    }
    /** 获取脚本路径 */
    get scriptPath() {
        return this.#dynamicScriptPath;
    }
    /** 设置脚本路径 */
    set scriptPath(value) {
        if (!value)
            throw errors_1.errors.argumentNull("value");
        if (!value.startsWith("/"))
            value = "/" + value;
        this.#dynamicScriptPath = value;
    }
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
        this.watchFile(physicalPath);
        if (physicalPath.endsWith(".js") == false)
            physicalPath = physicalPath + ".js";
        let cgiModule = require(physicalPath);
        let func = cgiModule["default"] || cgiModule;
        if (func == null)
            throw noDefaultExport(physicalPath);
        if (typeof func != "function")
            throw defaultExportNotFunction(physicalPath);
        let r = func(args);
        return r;
    }
}
exports.DynamicRequestProcessor = DynamicRequestProcessor;
