"use strict";
// import { FileProcessor } from "../file-processor";
// import { errorPages } from "../error-pages";
// import * as fs from "fs";
// import { StatusCode } from "../status-code";
// import { defaultContentTypes } from "../content-types";
// import { RequestResult, RequestProcessor } from "../request-processor";
// // export let staticFileProcessor = createFileProcessor();
// export let staticFileProcessor: FileProcessor = function (args): Promise<RequestResult> {
//     return new Promise<RequestResult>((resolve, reject) => {
//         if (!args.physicalPath) {
//             return resolve({ statusCode: StatusCode.NotFound, content: Buffer.from(errorPages.NotFound) });
//         }
//         if (!fs.existsSync(args.physicalPath)) {
//             let text = `Path ${args.physicalPath} is not exists.`;
//             return resolve({ statusCode: 404, content: Buffer.from(text) });
//         }
//         let arr = args.physicalPath.split(".");
//         let ext = arr[arr.length - 1];
//         let contentType = defaultContentTypes[ext as keyof typeof defaultContentTypes] || defaultContentTypes[".txt"];
//         let stat = fs.statSync(args.physicalPath);
//         // fs.readFile(args.physicalPath, (err, data) => {
//         //     if (err)
//         //         reject(err);
//         let data = fs.createReadStream(args.physicalPath); //fs.readFileSync(args.physicalPath);
//         let mtime: number = stat.mtime.valueOf();
//         let headers: RequestResult["headers"] = {
//             "Content-Type": contentType,
//             "Etag": JSON.stringify([stat.ino, stat.size, mtime].join('-')),
//             "Last-Modified": stat.mtime.toDateString(),
//         };
//         resolve({ statusCode: StatusCode.OK, content: data, headers });
//         // })
//     })
// }
