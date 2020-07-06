const { WebServer } = require("../out/web-server");
const assert = require("assert");
const Browser = require('zombie');

describe("web-server", function () {
    it("start auto port", async function () {
        let settings = {};
        new WebServer(settings);
        assert.notEqual(settings.port, null);
    })

    it("port setting", async function () {
        let settings = { port: 1024 };
        new WebServer(settings);
        assert.equal(settings.port, 1024);
    })

    it("getPathExtention", function () {
        let w = new WebServer({});
        let ext = w.getPathExtention("/aa.tt");
        assert.equal(ext, "tt");
    })

    it("file processor", async function () {
        let port = 1025;
        new WebServer({
            port: port,
            fileProcessors: {
                "tt": {
                    execute: () => {
                        return "hello world";
                    }
                }
            }
        });

        // Browser.localhost("127.0.0.1:1025", 3000)
        const browser = new Browser();
        await browser.visit(`http://127.0.0.1:${port}/a.tt`);
        assert.equal(browser.source, "hello world");

    })
})