import * as assert from "assert";
import { createWebServer, createBrowser, readFile } from "./common";
import { ProxyProcessor, ProxyConfig } from "../out";
import { ProxyRequestProcessor } from "../out/request-processors/proxy";

describe("proxy-processor", function () {

    let token = "abcde";
    let station = createWebServer();
    // let requestProcessorConfigs = {} as any;
    // let proxyConfig: ProxyConfig = {
    //     proxyTargets: {
    //         "/AdminWeiXin/(\\S+)": {
    //             targetUrl: `http://127.0.0.1:${station.port}/$1`,
    //             headers: function () {
    //                 return { token }
    //             }
    //         },
    //         // 用于测试异步 headers
    //         "/Proxy1/(\\S+)": {
    //             targetUrl: `http://127.0.0.1:${station.port}/$1`,
    //             headers: async function () {
    //                 return { token }
    //             }
    //         },
    //     }
    // }
    // requestProcessorConfigs[ProxyProcessor.name] = proxyConfig;

    let webserver = createWebServer();

    let proxyProcessor = webserver.requestProcessors.filter(o => o instanceof ProxyRequestProcessor)[0] as ProxyRequestProcessor;
    assert.notStrictEqual(proxyProcessor, null);
    proxyProcessor.proxyTargets = {
        "/AdminWeiXin/(\\S+)": {
            targetUrl: `http://127.0.0.1:${station.port}/$1`,
            headers: function () {
                return { token }
            }
        },
        // 用于测试异步 headers
        "/Proxy1/(\\S+)": {
            targetUrl: `http://127.0.0.1:${station.port}/$1`,
            headers: async function () {
                return { token }
            }
        },
    };

    it("request", async function () {
        let browser = createBrowser();
        let url = `http://127.0.0.1:${webserver.port}/AdminWeiXin/index.html`;
        await browser.visit(url);

        let filePhysicalPath = station.websiteDirectory.findFile("index.html");
        let text = readFile(filePhysicalPath);
        assert.equal(browser.source, text);
    })

    it("sync headers", async function () {
        let browser = createBrowser();
        let url = `http://127.0.0.1:${webserver.port}/AdminWeiXin/dynamic/headers-output.js`;
        await browser.visit(url);
        let obj = JSON.parse(browser.source);
        assert.equal(obj.token, token);
    })

    it("async headers", async function () {
        let browser = createBrowser();
        let url = `http://127.0.0.1:${webserver.port}/Proxy1/dynamic/headers-output.js`;
        await browser.visit(url);
        let obj = JSON.parse(browser.source);
        assert.equal(obj.token, token);
    })
})