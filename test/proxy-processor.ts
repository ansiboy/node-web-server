import * as assert from "assert";
import { createWebserver, createBrowser, readFile } from "./common";
import { ProxyRequestProcessor, ProxyConfig } from "../out";

describe("proxy-processor", function () {

    let station = createWebserver();
    let requestProcessorConfigs = {} as any;
    let proxyConfig: ProxyConfig = {
        proxyTargets: {
            "/AdminWeiXin/(\\S+)": { targetUrl: `http://127.0.0.1:${station.port}/$1` }
        }
    }
    requestProcessorConfigs[ProxyRequestProcessor.name] = proxyConfig;

    let webserver = createWebserver({ requestProcessorConfigs });

    it("request", async function () {
        let browser = createBrowser();
        let url = `http://127.0.0.1:${webserver.port}/index.html`;
        await browser.visit(url);

        let filePhysicalPath = station.root.findFile("index.html");
        let text = readFile(filePhysicalPath);
        assert.equal(browser.source, text);
    })
})