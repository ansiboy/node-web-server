"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_pages_1 = require("../error-pages");
const fs = require("fs");
const status_code_1 = require("../status-code");
exports.textFileProcessor = function (args) {
    if (!args.physicalPath)
        return { statusCode: status_code_1.StatusCode.NotFound, content: error_pages_1.errorPages.NotFound };
    if (!fs.existsSync(args.physicalPath))
        return { statusCode: 404, content: error_pages_1.errorPages.NotFound };
    let data = fs.readFileSync(args.physicalPath);
    return { statusCode: status_code_1.StatusCode.OK, content: data.toString() };
};
//# sourceMappingURL=static-file.js.map