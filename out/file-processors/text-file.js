"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_pages_1 = require("../error-pages");
const fs = require("fs");
const status_code_1 = require("../status-code");
const content_types_1 = require("../content-types");
exports.textFileProcessor = createFileProcessor();
function createFileProcessor() {
    let fileProcessor = function (args) {
        if (!args.physicalPath)
            return { statusCode: status_code_1.StatusCode.NotFound, content: Buffer.from(error_pages_1.errorPages.NotFound) };
        if (!fs.existsSync(args.physicalPath))
            return { statusCode: 404, content: Buffer.from(error_pages_1.errorPages.NotFound) };
        let arr = args.physicalPath.split(".");
        let ext = arr[arr.length - 1];
        let contentType = content_types_1.contentTypes[ext] || content_types_1.contentTypes.txt;
        let data = fs.readFileSync(args.physicalPath);
        let stat = fs.statSync(args.physicalPath);
        let mtime = stat.mtime.valueOf();
        let headers = {
            "Content-Type": contentType,
            "Etag": JSON.stringify([stat.ino, stat.size, mtime].join('-')),
            "Last-Modified": stat.mtime.toDateString(),
        };
        return { statusCode: status_code_1.StatusCode.OK, content: data, headers };
    };
    return fileProcessor;
}
