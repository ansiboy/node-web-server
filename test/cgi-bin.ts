import { createWebServer, createBrowser } from "./common";
import { default as cgiFuc } from "./website/cgi-bin/test";
import * as assert from "assert";

describe("cgi-bin", function () {
    it("test", async function () {
        let webServer = createWebServer();
        let browser = createBrowser();
        let url = `http://127.0.0.1:${webServer.port}/cgi-bin/test.js`;
        await browser.visit(url);
        let r = cgiFuc();
        assert.equal(browser.source, r.content);
    })
})