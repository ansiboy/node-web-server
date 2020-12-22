"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const out_1 = require("../out");
const assert = require("assert");
describe("RequestProcessorTypeCollection", function () {
    let webserver = common_1.createWebServer();
    it("find", () => {
        let type = webserver.requestProcessors.find(out_1.StaticFileProcessor);
        assert.ok(type != null);
    });
    it("add exists processor", () => {
        var p = new out_1.StaticFileProcessor();
        webserver.requestProcessors.add(p);
    });
});
