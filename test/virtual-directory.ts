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

        dir = root.findDirectory("/")
        assert.notEqual(dir, null);
        assert.equal(dir, root);
    })

    it("add path file", function () {
        let p1 = pathConcat(websitePath, "css/bootstrap.css");
        root.addPath("/content/bootstrap.css", p1);
        let p2 = root.findFile("/content/bootstrap.css");
        assert.equal(p2, p1);
    })

    it("add path directory", function () {
        let p1 = pathConcat(websitePath, "css");
        root.addPath("/content/css", p1);
        let p2 = root.findDirectory("/content/css");
        assert.notEqual(p2, null);
        assert.equal(p2?.physicalPath, p1);
    })
})