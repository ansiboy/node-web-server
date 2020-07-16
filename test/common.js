"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const out_1 = require("../out");
const path_concat_1 = require("../out/path-concat");
const Browser = require("zombie");
const fs = require("fs");
exports.websitePhysicalPath = path_concat_1.pathConcat(__dirname, "website");
function createWebServer(settings) {
    // let settings: Settings = { root: new VirtualDirectory(pathConcat(__dirname, "website")) };
    settings = settings || {};
    let mysettings = { websiteDirectory: exports.websitePhysicalPath };
    settings = Object.assign(settings, mysettings);
    let w = new out_1.WebServer(settings);
    console.log(`Web server port is ${settings.port}.`);
    return w;
}
exports.createWebServer = createWebServer;
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
