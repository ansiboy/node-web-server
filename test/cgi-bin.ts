import { createWebServer, createBrowser } from "./common";
import { default as cgiFuc } from "./website/dynamic/test";
import * as assert from "assert";

describe("dynamic", function () {
    it("test", async function () {
        let webServer = createWebServer();
        let browser = createBrowser();
        let url = `http://127.0.0.1:${webServer.port}/dynamic/test.js`;
        await browser.visit(url);
        let r = cgiFuc();
        assert.equal(browser.source, r.content);
    })
})