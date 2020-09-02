"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_file_1 = require("./text-file");
exports.defaultFileProcessors = {
    ".txt": text_file_1.staticFileProcessor,
    ".html": text_file_1.staticFileProcessor,
    ".js": text_file_1.staticFileProcessor,
    ".css": text_file_1.staticFileProcessor,
    ".json": text_file_1.staticFileProcessor,
    ".woff": text_file_1.staticFileProcessor,
    ".woff2": text_file_1.staticFileProcessor,
    ".ttf": text_file_1.staticFileProcessor,
};
