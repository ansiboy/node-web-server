import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import * as fs from "fs";
import { errors } from "../errors";
import { processorPriorities } from "./priority";
import { watch } from "fs";

export type DynamicScriptFunction = (args: RequestContext) => RequestResult | Promise<RequestResult>;

export const defaultDynamicPath = "/dynamic";

let noDefaultExport = (name: string) => {
    let error: Error = { message: `Module "${name}" has not a default export.`, name: "noDefaultExport" };
    return error;
};

let defaultExportNotFunction = (name: string) => {
    let error: Error = { message: `Default export of module '${name}' is not a function.`, name: "defaultExportNotFunction" };
    return error;
}

// export type Options = {
//     // 动态脚本夹的虚拟路径
//     directoryPath: string
// };

export class DynamicRequestProcessor implements RequestProcessor {

    // #dynamicScriptPath: string;

    priority = processorPriorities.DynamicRequestProcessor;

    private watches: { [key: string]: any } = {};

    // options: Options = { directoryPath: defaultDynamicPath };
    private directoryPath = defaultDynamicPath;

    constructor() {
        console.assert(defaultDynamicPath.startsWith("/"));
        // this.#dynamicScriptPath = defaultDynamicPath;
    }

    private watchFile(physicalPath: string) {
        if (this.watches[physicalPath]) {
            return;
        }

        this.watches[physicalPath] = physicalPath;
        watch(physicalPath).on("change", (eventType, file) => {
            delete require.cache[require.resolve(physicalPath)];
        })
    }

    /** 获取脚本路径 */
    get scriptPath() {
        return this.directoryPath;
    }
    /** 设置脚本路径 */
    set scriptPath(value) {
        if (!value) throw errors.argumentNull("value");
        if (!value.startsWith("/"))
            value = "/" + value;

        this.directoryPath = value;
    }

    execute(args: RequestContext) {
        if (args.virtualPath.startsWith(this.scriptPath) == false)
            return null;

        let physicalPath = args.rootDirectory.findFile(args.virtualPath);
        if (physicalPath == null) {
            throw errors.pageNotFound(args.virtualPath);
        }

        if (!fs.existsSync(physicalPath)) {
            throw errors.physicalPathNotExists(physicalPath);
        }

        this.watchFile(physicalPath);
        if (physicalPath.endsWith(".js") == false)
            physicalPath = physicalPath + ".js";

        let cgiModule = require(physicalPath);
        let func: DynamicScriptFunction = cgiModule["default"] || cgiModule;

        if (func == null)
            throw noDefaultExport(physicalPath);

        if (typeof func != "function")
            throw defaultExportNotFunction(physicalPath);

        let r = func(args);

        return r;
    }



}

