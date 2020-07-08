import { VirtualDirectory } from "../out/virtual-directory";
import { pathConcat } from "../out/path-concat";
import * as assert from "assert";
import * as  fs from "fs";

describe("virtual directory", function () {

    let websitePath = pathConcat(__dirname, "website");
    let root = new VirtualDirectory(websitePath);

    it("directories", function () {
        let dirs = root.directories();
        let names = Object.getOwnPropertyNames(dirs);
        let actualDirs = fs.readdirSync(websitePath)
            .filter(c => fs.statSync(pathConcat(websitePath, c)).isDirectory());
        assert.equal(names.length, actualDirs.length);
    })

    it("files", function () {
        let dirs = root.files();
        let names = Object.getOwnPropertyNames(dirs);
        let actualDirs = fs.readdirSync(websitePath)
            .filter(c => fs.statSync(pathConcat(websitePath, c)).isFile());
        assert.equal(names.length, actualDirs.length);
    })

    it("findDirectory", function () {
        let dir = root.findDirectory("/content");
        assert.notEqual(dir, null);
    })
})