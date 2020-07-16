import * as assert from "assert";
import { createWebServer, createBrowser, readFile } from "./common";
import { ProxyRequestProcessor, ProxyConfig } from "../out";

describe("proxy-processor", function () {

    let token = "abcde";
    let station = createWebServer();
    let requestProcessorConfigs = {} as any;
    let proxyConfig: ProxyConfig = {
        proxyTargets: {
            "/AdminWeiXin/(\\S+)": {
                targetUrl: `http://127.0.0.1:${station.port}/$1`,
                headers: function () {
                    return { token }
                }
            }
        }
    }
    requestProcessorConfigs[ProxyRequestProcessor.name] = proxyConfig;

    let webserver = createWebServer({ requestProcessorConfigs });

    it("request", async function () {
        let browser = createBrowser();
        let url = `http://127.0.0.1:${webserver.port}/AdminWeiXin/index.html`;
        await browser.visit(url);

        let filePhysicalPath = station.root.findFile("index.html");
        let text = readFile(filePhysicalPath);
        assert.equal(browser.source, text);
    })

    it("headers", async function () {
        let browser = createBrowser();
        let url = `http://127.0.0.1:${webserver.port}/AdminWeiXin/cgi-bin/headers-output.js`;
        await browser.visit(url);
        let obj = JSON.parse(browser.source);
        assert.equal(obj.token, token);
        // let filePhysicalPath = station.root.findFile("index.html");
        // let text = readFile(filePhysicalPath);
        // assert.equal(browser.source, text);
    })
})