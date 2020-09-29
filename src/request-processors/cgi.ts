import * as http from "http";
import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import * as fs from "fs";
import { errors } from "../errors";

export type DynamicScriptFunction = (args: RequestContext) => RequestResult | Promise<RequestResult>;

const defaultDynamicPath = "/dynamic";

let noDefaultExport = (name: string) => {
    let error: Error = { message: `Module "${name}" has not a default export.`, name: "noDefaultExport" };
    return error;
};

let defaultExportNotFunction = (name: string) => {
    let error: Error = { message: `Default export of module '${name}' is not a function.`, name: "defaultExportNotFunction" };
    return error;
}

export type DynamicRequestProcessorConfig = {
    // 动态脚本路径
    path?: string
};

export class DynamicRequestProcessor implements RequestProcessor {

    #dynamicScriptPath: string;

    constructor(config?: DynamicRequestProcessorConfig) {
        config = config || {};

        this.#dynamicScriptPath = config.path || defaultDynamicPath;
        if (!this.#dynamicScriptPath.startsWith("/"))
            this.#dynamicScriptPath = "/" + this.#dynamicScriptPath;
    }

    execute(args: RequestContext) {
        if (args.virtualPath.startsWith(this.#dynamicScriptPath) == false)
            return null;

        let physicalPath = args.rootDirectory.findFile(args.virtualPath);
        if (physicalPath == null) {
            throw errors.pageNotFound(args.virtualPath);
        }

        if (!fs.existsSync(physicalPath)) {
            throw errors.physicalPathNotExists(physicalPath);
        }

        if (physicalPath.endsWith(".js") == false)
            physicalPath = physicalPath + ".js";

        let cgiModule = require(physicalPath);
        let func: DynamicScriptFunction = cgiModule["default"];

        if (func == null)
            throw noDefaultExport(physicalPath);

        if (typeof func != "function")
            throw defaultExportNotFunction(physicalPath);

        let r = func(args);

        return r;
    }



}

