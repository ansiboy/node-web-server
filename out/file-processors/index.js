"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_file_1 = require("./static-file");
exports.defaultFileProcessors = {
    "txt": static_file_1.textFileProcessor,
    "html": static_file_1.textFileProcessor,
    "js": static_file_1.textFileProcessor,
    "css": static_file_1.textFileProcessor,
};
