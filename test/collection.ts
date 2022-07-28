import { processorPriorities } from "../out";
import { createWebServer } from "./common";
import * as assert from "assert";

describe("RequestProcessorTypeCollection", function () {
    
    let webserver = createWebServer();

    it("find", () => {
        let type = webserver.requestProcessors.find("static");
        assert.ok(type != null);
    })

    it("add exists processor", () => {

        var p = webserver.requestProcessors.find("static");// new StaticFileProcessor();
        assert.notStrictEqual(p, null);

        let error: any = null;

        try {
            webserver.requestProcessors.add("static", p, processorPriorities.Default);
        }
        catch (err) {
            error = err;
        }

        assert.notStrictEqual(error, null);
    })

    it("toArray", () => {
        var items = webserver.requestProcessors.items;
        assert.ok(items.length > 0);
        for (let i = 0; i < items.length - 2; i++) {
            assert.ok((items[i].priority as Number) < (items[i + 1].priority as Number));
        }

    })
})