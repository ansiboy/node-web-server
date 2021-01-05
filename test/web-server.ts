import { WebServer, Settings, StaticFileProcessor } from "../out";
import * as assert from "assert";
import Browser = require('zombie');
import { pathConcat } from "../out/path-concat";
import * as fs from "fs";
import { createWebServer } from "./common";
import { StatusCode } from "../out/status-code";
import * as path from "path";

describe("web-server", function () {

    let w = createWebServer();
    console.log(`Web server port is ${w.port}.`);
    const browser = new Browser();

    it("null settings", function () {
        var webserver = new WebServer();
        assert.notEqual(webserver.port, null);
        webserver.port;
    })

    it("start auto port", function () {
        let settings: Settings = {};
        var webserver = new WebServer(settings);
        assert.notEqual(webserver.port, null);
    })

    it("port setting", function () {
        let settings = { port: 1024 };
        new WebServer(settings);
        assert.equal(settings.port, 1024);
    })

    it("file index.html", async function () {
        await browser.visit(`http://127.0.0.1:${w.port}/index.html`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/index.html"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source);
    })

    it("default index.html", async function () {
        await browser.visit(`http://127.0.0.1:${w.port}`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/index.html"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source);
    })

    it("default index.js", async function () {
        await browser.visit(`http://127.0.0.1:${w.port}/index.js?a=5`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/index.js"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source);
    })

    it("javascript content type", async function () {
        await browser.visit(`http://127.0.0.1:${w.port}/index.js`);
        assert.ok(browser.response.headers.get("content-type").indexOf("javascript") > 0);
    })

    it("unsupport content type", async function () {
        browser.visit(`http://127.0.0.1:${w.port}/unsupport-file-type.bxs`).then(r => {
            debugger
        }).catch(r => {
            assert.equal(browser.status, StatusCode.UnsupportedMediaType);
        })
        // assert.equal(browser.response.headers.get("content-type"), contentTypes.js);
    })

    it("sample website", async function () {
        let w = new WebServer();
        let url = `http://127.0.0.1:${w.port}`;
        browser.visit(url).then(r => {
            let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "../sample-website/index.html"));
            let source: string = buffer.toString();
            assert.equal(browser.source, source);
        }).catch(err => {
            debugger
        })
    })

    it("virtual file", async function () {
        let w = new WebServer();
        w.websiteDirectory.setPath("index2.html", pathConcat(__dirname, "website/content/virutal-file.html"));
        await browser.visit(`http://127.0.0.1:${w.port}/index2.html`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/content/virutal-file.html"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source);
    })

    it("prcessor config file", async function () {
        let w = new WebServer({ websiteDirectory: path.join(__dirname, "website") });
        let p = w.requestProcessors.find(StaticFileProcessor);
        let config: StaticFileProcessor["options"] = require("./website/StaticFileProcessor.config.json");
        console.log(p.options.directoryPath);
    })
})