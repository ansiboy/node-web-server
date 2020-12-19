import { WebServer } from "../out";
import { RequestProcessorTypeCollection } from "../out/request-processors/collection";
import { createWebServer } from "./common";
import { StaticFileProcessor } from "../out";
import * as assert from "assert";

describe("RequestProcessorTypeCollection", function () {
    let webserver = createWebServer();
    it("find", () => {
        let type = webserver.requestProcessors.find(StaticFileProcessor);
        assert.ok(type != null);
    })
})