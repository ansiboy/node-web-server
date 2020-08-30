import { createWebServer, createBrowser } from "./common"
import * as assert from "assert";
import { LogLevel, getLogger } from "../out/logger";
import { pathConcat } from "../out";
import * as fs from "fs";

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

    it("logger", function () {
        let logPath = pathConcat(__dirname, "log.txt");
        if(fs.existsSync(logPath)){
            fs.unlinkSync(logPath);
        }
        
        let logger = getLogger("test", "info", logPath);
        logger.info("logger info test.");

        assert.ok(fs.existsSync(logPath));
    })
})