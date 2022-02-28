import { createWebServer } from "./common"
import { pathConcat, StaticFileProcessor } from "../out"
import Browser = require('zombie');
import * as fs from "fs";
import assert = require("assert");

describe("StaticFileRequestProcessor class test", function () {
    it("config", async function () {

        let w = createWebServer();
        var staticFileProcessor = w.requestProcessors.staticProcessor;
        assert.notStrictEqual(staticFileProcessor, null);

        staticFileProcessor.contentTypes[".less"] = "text/plain";

        const browser = new Browser();
        await browser.visit(`http://127.0.0.1:${w.port}/content/style.less`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/content/style.less"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source);
    })

    it("path", async function () {
        let w = createWebServer();
        var staticFileProcessor = w.requestProcessors.staticProcessor;
        assert.notStrictEqual(staticFileProcessor, null);

        staticFileProcessor.staticPath = "public";

        const browser = new Browser();
        await browser.visit(`http://127.0.0.1:${w.port}/temp.html`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/public/temp.html"));
        let source: string = buffer.toString();
        assert.strictEqual(browser.source, source);
    })

    it("ignore paths", async function () {

        let w = createWebServer();
        let staticFileProcessor = w.requestProcessors.staticProcessor;
        assert.notStrictEqual(staticFileProcessor, null);

        staticFileProcessor.staticPath = "public";

        const browser = new Browser();
        await browser.visit(`http://127.0.0.1:${w.port}/temp.html`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/public/temp.html"));
        let source: string = buffer.toString();
        assert.strictEqual(browser.source, source);

        try {
            staticFileProcessor.ignorePaths = ["/temp.html"];
            await browser.visit(`http://127.0.0.1:${w.port}/temp.html`);
        }
        catch (err) {
            assert.strictEqual(browser.status, 404);
        }
    })
})