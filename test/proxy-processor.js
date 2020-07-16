"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const common_1 = require("./common");
const out_1 = require("../out");
describe("proxy-processor", function () {
    let token = "abcde";
    let station = common_1.createWebServer();
    let requestProcessorConfigs = {};
    let proxyConfig = {
        proxyTargets: {
            "/AdminWeiXin/(\\S+)": {
                targetUrl: `http://127.0.0.1:${station.port}/$1`,
                headers: function () {
                    return { token };
                }
            },
            // 用于测试异步 headers
            "/Proxy1/(\\S+)": {
                targetUrl: `http://127.0.0.1:${station.port}/$1`,
                headers: function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        return { token };
                    });
                }
            },
        }
    };
    requestProcessorConfigs[out_1.ProxyRequestProcessor.name] = proxyConfig;
    let webserver = common_1.createWebServer({ requestProcessorConfigs });
    it("request", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let browser = common_1.createBrowser();
            let url = `http://127.0.0.1:${webserver.port}/AdminWeiXin/index.html`;
            yield browser.visit(url);
            let filePhysicalPath = station.websiteDirectory.findFile("index.html");
            let text = common_1.readFile(filePhysicalPath);
            assert.equal(browser.source, text);
        });
    });
    it("sync headers", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let browser = common_1.createBrowser();
            let url = `http://127.0.0.1:${webserver.port}/AdminWeiXin/cgi-bin/headers-output.js`;
            yield browser.visit(url);
            let obj = JSON.parse(browser.source);
            assert.equal(obj.token, token);
        });
    });
    it("async headers", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let browser = common_1.createBrowser();
            let url = `http://127.0.0.1:${webserver.port}/Proxy1/cgi-bin/headers-output.js`;
            yield browser.visit(url);
            let obj = JSON.parse(browser.source);
            assert.equal(obj.token, token);
        });
    });
});
