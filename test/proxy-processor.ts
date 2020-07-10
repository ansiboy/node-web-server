import * as assert from "assert";
import { createWebserver, createBrowser, readFile } from "./common";

describe("proxy-processor", function () {
    let webserver = createWebserver();
    let station = createWebserver();
  
    it("request", async function () {
        webserver.requestProcessors.proxy.proxyTargets["/AdminWeiXin/(\\S+)"] = {
            targetUrl: `http://127.0.0.1:${station.port}/$1`
        };

        let browser = createBrowser();
        let url = `http://127.0.0.1:${webserver.port}/AdminWeiXin/index.html`;
        await browser.visit(url);

        let filePhysicalPath = station.root.findFile("index.html");
        let text = readFile(filePhysicalPath);
        assert.equal(browser.source, text);
    })
})