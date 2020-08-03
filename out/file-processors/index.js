"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_file_1 = require("./text-file");
exports.defaultFileProcessors = {
    ".txt": text_file_1.textFileProcessor,
    ".html": text_file_1.textFileProcessor,
    ".js": text_file_1.textFileProcessor,
    ".css": text_file_1.textFileProcessor,
    ".json": text_file_1.textFileProcessor,
    ".woff": text_file_1.textFileProcessor,
    ".ttf": text_file_1.textFileProcessor,
};
