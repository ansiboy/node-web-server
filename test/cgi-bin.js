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
const test_1 = require("./website/cgi-bin/test");
const assert = require("assert");
describe("cgi-bin", function () {
    it("test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let webServer = common_1.createWebServer();
            let browser = common_1.createBrowser();
            let url = `http://127.0.0.1:${webServer.port}/cgi-bin/test.js`;
            yield browser.visit(url);
            let r = test_1.default();
            assert.equal(browser.source, r.content);
        });
    });
});
