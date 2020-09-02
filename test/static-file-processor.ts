import { createWebServer } from "./common"
import { StaticFileRequestProcessorConfig, pathConcat } from "../out"
import Browser = require('zombie');
import * as fs from "fs";
import assert = require("assert");

describe("StaticFileRequestProcessor class test", function () {
    it("config", async function () {
        let config: StaticFileRequestProcessorConfig = {
            staticFileExtentions: [".less"]
        }
        let w = createWebServer({
            requestProcessorConfigs: {
                StaticFile: config
            }
        })

        const browser = new Browser();
        await browser.visit(`http://127.0.0.1:${w.port}/content/style.less`);
        let buffer: Buffer = fs.readFileSync(pathConcat(__dirname, "website/content/style.less"));
        let source: string = buffer.toString();
        assert.equal(browser.source, source);
    })
})