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
const assert = require("assert");
const out_1 = require("../out");
const fs = require("fs");
describe("rewrite", function () {
    it("rewrite 1", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let server = common_1.createWebServer({
                pathRewrite: {
                    "/test.html": "/index.html"
                }
            });
            let browser = common_1.createBrowser();
            yield browser.visit(`http://127.0.0.1:${server.port}/test.html`);
            let indexPath = out_1.pathConcat(__dirname, "website/index.html");
            assert.ok(fs.existsSync(indexPath), "index.html is not exists.");
            let indexContent = fs.readFileSync(indexPath).toString();
            assert.strictEqual(browser.source, indexContent);
            // let h = browser.response.headers.get("physical-path");
            // assert.notEqual(h || "", "");
        });
    });
    it("rewrite 2", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let server = common_1.createWebServer({
                pathRewrite: {
                    "test.html": "/index.html"
                }
            });
            let browser = common_1.createBrowser();
            yield browser.visit(`http://127.0.0.1:${server.port}/test.html`);
            let indexPath = out_1.pathConcat(__dirname, "website/index.html");
            assert.ok(fs.existsSync(indexPath), "index.html is not exists.");
            let indexContent = fs.readFileSync(indexPath).toString();
            assert.strictEqual(browser.source, indexContent);
        });
    });
    it("rewrite 3", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let server = common_1.createWebServer({
                pathRewrite: {
                    "dir/(\\S+)": "/$1.html"
                }
            });
            let browser = common_1.createBrowser();
            yield browser.visit(`http://127.0.0.1:${server.port}/dir/index`);
            let indexPath = out_1.pathConcat(__dirname, "website/index.html");
            assert.ok(fs.existsSync(indexPath), "index.html is not exists.");
            let indexContent = fs.readFileSync(indexPath).toString();
            assert.strictEqual(browser.source, indexContent);
        });
    });
});
