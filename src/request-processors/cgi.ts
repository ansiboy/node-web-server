import * as http from "http";
import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import * as fs from "fs";
import { errors } from "../errors";

export type CGIFunction = (args: RequestContext) => RequestResult | Promise<RequestResult>;

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
        let func: CGIFunction = cgiModule["default"];

        if (func == null)
            throw noDefaultExport(physicalPath);

        if (typeof func != "function")
            throw defaultExportNotFunction(physicalPath);

        let r = func(args);

        return r;
    }



}

