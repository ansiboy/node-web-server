import { WebServer, Settings } from "../out";
import * as assert from "assert";
import Browser = require('zombie');
import { pathConcat } from "../out/path-concat";
import * as fs from "fs";
import { contentTypes } from "../out/content-types";
import { createWebserver } from "./common";

describe("web-server", function () {

    let w = createWebserver();
    console.log(`Web server port is ${w.port}.`);
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
        await browser.visit(`http://127.0.0.1:${w.port}/index.html`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/index.html"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source.toString());
    })

    it("default index.html", async function () {
        await browser.visit(`http://127.0.0.1:${w.port}`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/index.html"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source.toString());
    })

    it("default index.js", async function () {
        await browser.visit(`http://127.0.0.1:${w.port}/index.js?a=5`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/index.js"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source.toString());
    })

    it("javascript content type", async function () {
        await browser.visit(`http://127.0.0.1:${w.port}/index.js`);
        assert.equal(browser.response.headers.get("content-type"), contentTypes.js);
    })

})