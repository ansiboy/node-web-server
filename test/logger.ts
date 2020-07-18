import { createWebServer, createBrowser } from "./common"
import * as assert from "assert";
import { LogLevel } from "../out/logger";

describe("logger", function () {
    it("default loglevel", function () {
        let server = createWebServer();
        let defaultLogLevel: LogLevel = "all";
        assert.equal(server.logLevel, defaultLogLevel);
    })

    it("static file physical path header", async function () {
        let server = createWebServer();
        let browser = createBrowser();
        await browser.visit(`http://127.0.0.1:${server.port}/index.html`);
        let h = browser.response.headers.get("physical-path");
        assert.notEqual(h || "", "");
    })
})