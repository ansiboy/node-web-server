"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const out_1 = require("../out");
const common_1 = require("./common");
const assert = require("assert");
describe("RequestProcessorTypeCollection", function () {
    let webserver = common_1.createWebServer();
    it("find", () => {
        let type = webserver.requestProcessors.find("static");
        assert.ok(type != null);
    });
    it("add exists processor", () => {
        var p = webserver.requestProcessors.find("static"); // new StaticFileProcessor();
        assert.notStrictEqual(p, null);
        let error = null;
        try {
            webserver.requestProcessors.add("static", p, out_1.processorPriorities.Default);
        }
        catch (err) {
            error = err;
        }
        assert.notStrictEqual(error, null);
    });
    it("toArray", () => {
        var items = webserver.requestProcessors.items;
        assert.ok(items.length > 0);
        for (let i = 0; i < items.length - 2; i++) {
            assert.ok(items[i].priority < items[i + 1].priority);
        }
    });
});
//# sourceMappingURL=collection.js.map