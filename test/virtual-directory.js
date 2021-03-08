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
        dir = root.findDirectory("/");
        assert.notEqual(dir, null);
        assert.equal(dir, root);
    });
    it("add path file simple", function () {
        let p1 = path_concat_1.pathConcat(websitePath, "css/bootstrap.css");
        root.setPath("bootstrap1.css", p1);
        let p2 = root.findFile("bootstrap1.css");
        assert.strictEqual(p2, p1);
    });
    it("add path file", function () {
        let p1 = path_concat_1.pathConcat(websitePath, "css/bootstrap.css");
        root.setPath("/content/bootstrap.css", p1);
        let dir = root.findDirectory("content");
        assert.ok(dir != null);
        let p2 = root.findFile("/content/bootstrap.css");
        assert.strictEqual(p2, p1);
    });
    it("add path directory", function () {
        let p1 = path_concat_1.pathConcat(websitePath, "css");
        root.setPath("/content/css", p1);
        let p2 = root.findDirectory("/content/css");
        assert.notStrictEqual(p2, null);
        assert.strictEqual(p2 === null || p2 === void 0 ? void 0 : p2.physicalPath, p1);
    });
    it("direcotry same", function () {
        let d1 = root.findDirectory("css");
        assert.ok(d1 != null);
        let d2 = root.findDirectory("css");
        assert.strictEqual(d1, d2);
        let temp1 = root.findDirectory("css/temp");
        assert.ok(temp1 != null);
        if (d2 == null)
            throw "d2 is null";
        let temp2 = d2.findDirectory("temp");
        assert.strictEqual(temp1, temp2);
    });
});
