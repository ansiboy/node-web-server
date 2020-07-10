import { RequestProcessor } from "../request-processor";
import { pathConcat } from "../path-concat";
import { defaultFileProcessors } from "../file-processors";
import { errors } from "../errors";

export let staticFileRequestProcessor: RequestProcessor = function (args) {

    if (args.physicalPath == null)
        throw errors.pageNotFound(args.virtualPath);

    let ext = "";
    if (args.physicalPath.indexOf(".") < 0) {
        args.physicalPath = pathConcat(args.physicalPath, "index.html");
    }

    let arr = args.physicalPath.split(".");
    console.assert(arr.length == 2);
    ext = arr[1];

    let fileProcessor = defaultFileProcessors[ext];
    if (fileProcessor == null)
        throw errors.fileTypeNotSupport(ext);

    return fileProcessor(args);

}