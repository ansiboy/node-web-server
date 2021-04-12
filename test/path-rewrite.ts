import { createWebServer, createBrowser } from "./common"
import * as assert from "assert";
import { LogLevel, getLogger } from "../out/logger";
import { pathConcat } from "../out";
import * as fs from "fs";

describe("rewrite", function () {

    it("rewrite 1", async function () {
        let server = createWebServer({
            urlRewrite: {
                "/test.html": "/index.html"
            }
        });
        let browser = createBrowser();
        await browser.visit(`http://127.0.0.1:${server.port}/test.html`);

        let indexPath = pathConcat(__dirname, "website/index.html");
        assert.ok(fs.existsSync(indexPath), "index.html is not exists.");
        let indexContent = fs.readFileSync(indexPath).toString();
        assert.strictEqual(browser.source, indexContent);



        // let h = browser.response.headers.get("physical-path");
        // assert.notEqual(h || "", "");
    })

    it("rewrite 2", async function () {
        let server = createWebServer({
            urlRewrite: {
                "test.html": "/index.html"
            }
        });
        let browser = createBrowser();
        await browser.visit(`http://127.0.0.1:${server.port}/test.html`);

        let indexPath = pathConcat(__dirname, "website/index.html");
        assert.ok(fs.existsSync(indexPath), "index.html is not exists.");
        let indexContent = fs.readFileSync(indexPath).toString();
        assert.strictEqual(browser.source, indexContent);


    })

    it("rewrite 3", async function () {
        let server = createWebServer({
            urlRewrite: {
                "dir/(\\S+)": "/$1.html"
            }
        });
        let browser = createBrowser();
        await browser.visit(`http://127.0.0.1:${server.port}/dir/index`);

        let indexPath = pathConcat(__dirname, "website/index.html");
        assert.ok(fs.existsSync(indexPath), "index.html is not exists.");
        let indexContent = fs.readFileSync(indexPath).toString();
        assert.strictEqual(browser.source, indexContent);
    })

    it("rewrite func", async function () {
        let server = createWebServer({
            urlRewrite: (url) => {
                return "/index.html";
            }
        });
        let browser = createBrowser();
        await browser.visit(`http://127.0.0.1:${server.port}/dir/index`);

        let indexPath = pathConcat(__dirname, "website/index.html");
        assert.ok(fs.existsSync(indexPath), "index.html is not exists.");
        let indexContent = fs.readFileSync(indexPath).toString();
        assert.strictEqual(browser.source, indexContent);
    })

})