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
var _dynamicScriptPath;
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
        _dynamicScriptPath.set(this, void 0);
        config = config || {};
        __classPrivateFieldSet(this, _dynamicScriptPath, config.path || defaultDynamicPath);
        if (!__classPrivateFieldGet(this, _dynamicScriptPath).startsWith("/"))
            __classPrivateFieldSet(this, _dynamicScriptPath, "/" + __classPrivateFieldGet(this, _dynamicScriptPath));
    }
    execute(args) {
        if (args.virtualPath.startsWith(__classPrivateFieldGet(this, _dynamicScriptPath)) == false)
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
_dynamicScriptPath = new WeakMap();
