import { FileProcessor } from "../file-processor";
import { errorPages } from "../error-pages";
import * as fs from "fs";
import { StatusCode } from "../status-code";
import { contentTypes } from "../content-types";

export let textFileProcessor: FileProcessor = function (args) {
    if (!args.physicalPath)
        return { statusCode: StatusCode.NotFound, content: errorPages.NotFound };

    if (!fs.existsSync(args.physicalPath))
        return { statusCode: 404, content: errorPages.NotFound };

    let data = fs.readFileSync(args.physicalPath);

    return { statusCode: StatusCode.OK, content: data.toString() };

}