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
const out_1 = require("../out");
const Browser = require("zombie");
const fs = require("fs");
const assert = require("assert");
describe("StaticFileRequestProcessor class test", function () {
    it("config", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let w = common_1.createWebServer();
            var staticFileProcessor = w.requestProcessors.filter(o => o instanceof out_1.StaticFileProcessor).item(0);
            assert.notStrictEqual(staticFileProcessor, null);
            staticFileProcessor.contentTypes[".less"] = "text/plain";
            const browser = new Browser();
            yield browser.visit(`http://127.0.0.1:${w.port}/content/style.less`);
            let buffer = fs.readFileSync(out_1.pathConcat(__dirname, "website/content/style.less"));
            let source = buffer.toString();
            assert.equal(browser.source, source);
        });
    });
});
