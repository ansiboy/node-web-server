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
const out_1 = require("../out");
const assert = require("assert");
const Browser = require("zombie");
const path_concat_1 = require("../out/path-concat");
const fs = require("fs");
const common_1 = require("./common");
const status_code_1 = require("../out/status-code");
describe("web-server", function () {
    let w = common_1.createWebServer();
    console.log(`Web server port is ${w.port}.`);
    const browser = new Browser();
    it("null settings", function () {
        var webserver = new out_1.WebServer();
        assert.notEqual(webserver.port, null);
        webserver.port;
    });
    it("start auto port", function () {
        let settings = {};
        var webserver = new out_1.WebServer(settings);
        assert.notEqual(webserver.port, null);
    });
    it("port setting", function () {
        let settings = { port: 1024 };
        new out_1.WebServer(settings);
        assert.equal(settings.port, 1024);
    });
    it("file index.html", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield browser.visit(`http://127.0.0.1:${w.port}/index.html`);
            let buffer = fs.readFileSync(path_concat_1.pathConcat(__dirname, "website/index.html"));
            let source = buffer.toString();
            assert.equal(browser.source, source);
        });
    });
    it("default index.html", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield browser.visit(`http://127.0.0.1:${w.port}`);
            let buffer = fs.readFileSync(path_concat_1.pathConcat(__dirname, "website/index.html"));
            let source = buffer.toString();
            assert.equal(browser.source, source);
        });
    });
    it("default index.js", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield browser.visit(`http://127.0.0.1:${w.port}/index.js?a=5`);
            let buffer = fs.readFileSync(path_concat_1.pathConcat(__dirname, "website/index.js"));
            let source = buffer.toString();
            assert.equal(browser.source, source);
        });
    });
    it("javascript content type", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield browser.visit(`http://127.0.0.1:${w.port}/index.js`);
            assert.ok(browser.response.headers.get("content-type").indexOf("javascript") > 0);
        });
    });
    it("unsupport content type", function () {
        return __awaiter(this, void 0, void 0, function* () {
            browser.visit(`http://127.0.0.1:${w.port}/unsupport-file-type.bxs`).then(r => {
                debugger;
            }).catch(r => {
                assert.equal(browser.status, status_code_1.StatusCode.UnsupportedMediaType);
            });
            // assert.equal(browser.response.headers.get("content-type"), contentTypes.js);
        });
    });
    it("sample website", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let w = new out_1.WebServer();
            let url = `http://127.0.0.1:${w.port}`;
            browser.visit(url).then(r => {
                let buffer = fs.readFileSync(path_concat_1.pathConcat(__dirname, "../sample-website/index.html"));
                let source = buffer.toString();
                assert.equal(browser.source, source);
            }).catch(err => {
                debugger;
            });
        });
    });
    it("virtual file", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let w = new out_1.WebServer();
            w.websiteDirectory.setPath("index2.html", path_concat_1.pathConcat(__dirname, "website/content/virutal-file.html"));
            yield browser.visit(`http://127.0.0.1:${w.port}/index2.html`);
            let buffer = fs.readFileSync(path_concat_1.pathConcat(__dirname, "website/content/virutal-file.html"));
            let source = buffer.toString();
            assert.equal(browser.source, source);
        });
    });
});
