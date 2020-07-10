import { WebServer, Settings } from "../out";
import * as assert from "assert";
import Browser = require('zombie');
const { VirtualDirectory } = require("../out/virtual-directory");
import { pathConcat } from "../out/path-concat";
import * as fs from "fs";

describe("web-server", function () {

    let settings: Settings = { root: new VirtualDirectory(pathConcat(__dirname, "website")) };
    let w = new WebServer(settings);
    console.log(`Web server port is ${settings.port}.`);
    const browser = new Browser();

    it("start auto port", async function () {
        let settings: Settings = {};
        new WebServer(settings);
        assert.notEqual(settings.port, null);
    })

    it("port setting", async function () {
        let settings = { port: 1024 };
        new WebServer(settings);
        assert.equal(settings.port, 1024);
    })

    it("file index.html", async function () {
        await browser.visit(`http://127.0.0.1:${settings.port}/index.html`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/index.html"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source.toString());
    })

    it("default index.html", async function () {
        await browser.visit(`http://127.0.0.1:${settings.port}`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/index.html"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source.toString());
    })

})