import { createWebServer, createBrowser, websitePhysicalPath, readFile } from "./common"

import * as assert from "assert";
import { pathConcat } from "../out/path-concat";

describe("content-transform", function () {

    let remarkText = "\r\n// Hello Word";
    let fileText = readFile(pathConcat(websitePhysicalPath, "index.js"));
    let remarkText1 = "\r\n// Hello Node Web Server";

    it("sync content transform", async function () {

        let w = createWebServer({
            contentTransforms: [
                (c) => {
                    let text = typeof c == "string" ? c : c.toString();
                    text = text + remarkText;
                    return text;
                }
            ]
        });
        let b = createBrowser();
        let url = `http://127.0.0.1:${w.port}/index.js`;

        await b.visit(url);
        let target = fileText + remarkText;
        assert.equal(b.source, target);
    })

    it("async content transform", async function () {
        let w = createWebServer({
            contentTransforms: [
                async (c) => {
                    let text = typeof c == "string" ? c : c.toString();
                    text = text + remarkText;
                    return text;
                }
            ]
        });
        let b = createBrowser();
        let url = `http://127.0.0.1:${w.port}/index.js`;

        await b.visit(url);
        let target = fileText + remarkText;
        assert.equal(b.source, target);
    })

    it("multi content transform", async function () {
        let w = createWebServer({
            contentTransforms: [
                async (c) => {
                    let text = typeof c == "string" ? c : c.toString();
                    text = text + remarkText;
                    return text;
                },
                (c) => {
                    let text = typeof c == "string" ? c : c.toString();
                    text = text + remarkText1;
                    return text;
                }
            ]
        });
        let b = createBrowser();
        let url = `http://127.0.0.1:${w.port}/index.js`;

        await b.visit(url);
        let target = fileText + remarkText + remarkText1;
        assert.equal(b.source, target);
    })
})