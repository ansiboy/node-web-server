import * as http from "http";
import { RequestProcessor, RequestContext, ExecuteResult } from "../request-processor";
import * as fs from "fs";
import { errors } from "../errors";

export type CGIFunction = (args: RequestContext) => ExecuteResult | Promise<ExecuteResult>;

const cgiPath = "/cgi-bin";

let noDefaultExport = (name: string) => {
    let error: Error = { message: `Module "${name}" has not a default export.`, name: "noDefaultExport" };
    return error;
};

let defaultExportNotFunction = (name: string) => {
    let error: Error = { message: `Default export of module '${name}' is not a function.`, name: "defaultExportNotFunction" };
    return error;
}

export class CGIRequestProcessor implements RequestProcessor {

    execute(args: RequestContext) {
        if (args.virtualPath.startsWith(cgiPath) == false)
            return null;

        if (args.physicalPath == null || !fs.existsSync(args.physicalPath)) {
            throw errors.pageNotFound(args.physicalPath || args.virtualPath)
        }

        if (args.physicalPath.endsWith(".js") == false)
            args.physicalPath = args.physicalPath + ".js";

        let cgiModule = require(args.physicalPath);
        let func: CGIFunction = cgiModule["default"];

        if (func == null)
            throw noDefaultExport(args.physicalPath);

        if (typeof func != "function")
            throw defaultExportNotFunction(args.physicalPath);

        let r = func(args);

        return r;
    }



}

