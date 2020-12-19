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
const common_1 = require("./common");
const test_1 = require("./website/dynamic/test");
const assert = require("assert");
const out_1 = require("../out");
describe("dynamic", function () {
    it("test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let webServer = common_1.createWebServer();
            let browser = common_1.createBrowser();
            let url = `http://127.0.0.1:${webServer.port}/dynamic/test.js`;
            yield browser.visit(url);
            let r = test_1.default();
            assert.strictEqual(browser.source, r.content);
        });
    });
    it("path", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let webServer = common_1.createWebServer();
            /*
            {
                requestProcessorConfigs: {
                    Dynamic: {
                        path: "cgi-bin"
                    }
                }
            }/*/
            let dynamicRequestProcessor = webServer.requestProcessors.find(out_1.DynamicRequestProcessor);
            dynamicRequestProcessor.scriptPath = "cgi-bin";
            let browser = common_1.createBrowser();
            let url = `http://127.0.0.1:${webServer.port}/cgi-bin/test.js`;
            yield browser.visit(url);
            let r = test_1.default();
            assert.strictEqual(browser.source, r.content);
        });
    });
});
