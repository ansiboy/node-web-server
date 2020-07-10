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
const { VirtualDirectory } = require("../out/virtual-directory");
const path_concat_1 = require("../out/path-concat");
const fs = require("fs");
describe("web-server", function () {
    let settings = { root: new VirtualDirectory(path_concat_1.pathConcat(__dirname, "website")) };
    let w = new out_1.WebServer(settings);
    console.log(`Web server port is ${settings.port}.`);
    const browser = new Browser();
    it("start auto port", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let settings = {};
            new out_1.WebServer(settings);
            assert.notEqual(settings.port, null);
        });
    });
    it("port setting", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let settings = { port: 1024 };
            new out_1.WebServer(settings);
            assert.equal(settings.port, 1024);
        });
    });
    it("file index.html", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield browser.visit(`http://127.0.0.1:${settings.port}/index.html`);
            let buffer = fs.readFileSync(path_concat_1.pathConcat(__dirname, "website/index.html"));
            let source = buffer.toString();
            assert.equal(browser.source, source.toString());
        });
    });
    it("default index.html", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield browser.visit(`http://127.0.0.1:${settings.port}`);
            let buffer = fs.readFileSync(path_concat_1.pathConcat(__dirname, "website/index.html"));
            let source = buffer.toString();
            assert.equal(browser.source, source.toString());
        });
    });
    it("default index.js", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield browser.visit(`http://127.0.0.1:${settings.port}/index.js`);
            let buffer = fs.readFileSync(path_concat_1.pathConcat(__dirname, "website/index.js"));
            let source = buffer.toString();
            assert.equal(browser.source, source.toString());
        });
    });
});
