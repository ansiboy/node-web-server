"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const virtual_directory_1 = require("../out/virtual-directory");
const path_concat_1 = require("../out/path-concat");
const assert = require("assert");
const fs = require("fs");
describe("virtual directory", function () {
    let websitePath = path_concat_1.pathConcat(__dirname, "website");
    let root = new virtual_directory_1.VirtualDirectory(websitePath);
    it("directories", function () {
        let dirs = root.directories();
        let names = Object.getOwnPropertyNames(dirs);
        let actualDirs = fs.readdirSync(websitePath)
            .filter(c => fs.statSync(path_concat_1.pathConcat(websitePath, c)).isDirectory());
        assert.equal(names.length, actualDirs.length);
    });
    it("files", function () {
        let dirs = root.files();
        let names = Object.getOwnPropertyNames(dirs);
        let actualDirs = fs.readdirSync(websitePath)
            .filter(c => fs.statSync(path_concat_1.pathConcat(websitePath, c)).isFile());
        assert.equal(names.length, actualDirs.length);
    });
    it("findDirectory", function () {
        let dir = root.findDirectory("/content");
        assert.notEqual(dir, null);
    });
    it("add path", function () {
        let p1 = path_concat_1.pathConcat(websitePath, "css/bootstrap.css");
        root.addPath("/content/bootstrap.css", p1);
        let p2 = root.findFile("/content/bootstrap.css");
        assert.equal(p2, p1);
    });
});
