"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_pages_1 = require("../error-pages");
const fs = require("fs");
const status_code_1 = require("../status-code");
const content_types_1 = require("../content-types");
// export let staticFileProcessor = createFileProcessor();
exports.staticFileProcessor = function (args) {
    return new Promise((resolve, reject) => {
        if (!args.physicalPath)
            return resolve({ statusCode: status_code_1.StatusCode.NotFound, content: Buffer.from(error_pages_1.errorPages.NotFound) });
        if (!fs.existsSync(args.physicalPath))
            return resolve({ statusCode: 404, content: Buffer.from(error_pages_1.errorPages.NotFound) });
        let arr = args.physicalPath.split(".");
        let ext = arr[arr.length - 1];
        let contentType = content_types_1.contentTypes[ext] || content_types_1.contentTypes.txt;
        let stat = fs.statSync(args.physicalPath);
        // fs.readFile(args.physicalPath, (err, data) => {
        //     if (err)
        //         reject(err);
        let data = fs.createReadStream(args.physicalPath); //fs.readFileSync(args.physicalPath);
        let mtime = stat.mtime.valueOf();
        let headers = {
            "Content-Type": contentType,
            "Etag": JSON.stringify([stat.ino, stat.size, mtime].join('-')),
            "Last-Modified": stat.mtime.toDateString(),
        };
        resolve({ statusCode: status_code_1.StatusCode.OK, content: data, headers });
        // })
    });
};
