import { FileProcessor } from "../file-processor";
import { errorPages } from "../error-pages";
import * as fs from "fs";
import { StatusCode } from "../status-code";
import { contentTypes } from "../content-types";
import { RequestResult, RequestProcessor } from "../request-processor";

export let textFileProcessor = createFileProcessor();

function createFileProcessor(): FileProcessor {
    let fileProcessor: FileProcessor = function (args): Promise<RequestResult> {
        return new Promise<RequestResult>((resolve, reject) => {
            if (!args.physicalPath)
                return Promise.resolve({ statusCode: StatusCode.NotFound, content: Buffer.from(errorPages.NotFound) });

            if (!fs.existsSync(args.physicalPath))
                return Promise.resolve({ statusCode: 404, content: Buffer.from(errorPages.NotFound) });

            let arr = args.physicalPath.split(".");
            let ext = arr[arr.length - 1];
            let contentType = contentTypes[ext as keyof typeof contentTypes] || contentTypes.txt;
            let stat = fs.statSync(args.physicalPath);
            // fs.readFile(args.physicalPath, (err, data) => {
            //     if (err)
            //         reject(err);

            let data = fs.createReadStream(args.physicalPath); //fs.readFileSync(args.physicalPath);
            let mtime: number = stat.mtime.valueOf();
            let headers: RequestResult["headers"] = {
                "Content-Type": contentType,
                "Etag": JSON.stringify([stat.ino, stat.size, mtime].join('-')),
                "Last-Modified": stat.mtime.toDateString(),
            };

            resolve({ statusCode: StatusCode.OK, content: data, headers });
            // })

        })
    }

    return fileProcessor;
}

