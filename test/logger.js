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
describe("logger", function () {
    it("default loglevel", function () {
        let server = common_1.createWebServer();
        let defaultLogLevel = "all";
        assert.equal(server.logLevel, defaultLogLevel);
    });
    it("static file physical path header", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let server = common_1.createWebServer();
            let browser = common_1.createBrowser();
            yield browser.visit(`http://127.0.0.1:${server.port}/index.html`);
            let h = browser.response.headers.get("physical-path");
            assert.notEqual(h || "", "");
        });
    });
});
