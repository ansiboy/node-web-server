"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const out_1 = require("../out");
const virtual_directory_1 = require("../out/virtual-directory");
const path_concat_1 = require("../out/path-concat");
const Browser = require("zombie");
const fs = require("fs");
exports.websitePhysicalPath = path_concat_1.pathConcat(__dirname, "website");
function createWebserver(settings) {
    // let settings: Settings = { root: new VirtualDirectory(pathConcat(__dirname, "website")) };
    settings = settings || {};
    settings = Object.assign(settings, {
        root: new virtual_directory_1.VirtualDirectory(exports.websitePhysicalPath)
    });
    let w = new out_1.WebServer(settings);
    console.log(`Web server port is ${settings.port}.`);
    return w;
}
exports.createWebserver = createWebserver;
function createBrowser() {
    return new Browser();
}
exports.createBrowser = createBrowser;
function readFile(physicalPath) {
    if (physicalPath == null)
        throw new Error(`Argument physicalPaht is null.`);
    if (fs.existsSync(physicalPath) == false)
        throw new Error(`File ${physicalPath} is not exists.`);
    let buffer = fs.readFileSync(physicalPath);
    let source = buffer.toString();
    return source;
}
exports.readFile = readFile;