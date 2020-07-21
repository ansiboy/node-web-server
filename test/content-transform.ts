import { createWebServer, createBrowser, websitePhysicalPath, readFile } from "./common"

import * as assert from "assert";
import * as stream from "stream";
import { pathConcat } from "../out/path-concat";
import { RequestResult } from "../out";

describe("content-transform", function () {

    let remarkText = "\r\n// Hello Word";
    let fileText = readFile(pathConcat(websitePhysicalPath, "index.js"));
    let remarkText1 = "\r\n// Hello Node Web Server";

    it("sync content transform", async function () {

        let w = createWebServer({
            requestResultTransforms: [
                async (r, c) => {
                    let text = await new Promise<string>((resolve, reject) => {
                        if (r.content instanceof stream.Readable) {
                            let buffer = Buffer.from([]);
                            r.content.on("data", (data) => {
                                buffer = Buffer.concat([buffer, data])
                            })
                            r.content.on("end", function () {
                                resolve(buffer.toString())
                            })
                            r.content.on("error", function (err) {
                                reject(err);
                            })
                        }
                        else if (typeof r.content == "string") {
                            resolve(r.content)
                        }
                        else {
                            resolve(r.content.toString());
                        }
                    })

                    text = text + remarkText;
                    r.content = text;

                    return r;
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
            requestResultTransforms: [
                async (r, c) => {
                    let text = await new Promise<string>((resolve, reject) => {
                        if (r.content instanceof stream.Readable) {
                            let buffer = Buffer.from([]);
                            r.content.on("data", (data) => {
                                buffer = Buffer.concat([buffer, data])
                            })
                            r.content.on("end", function () {
                                resolve(buffer.toString())
                            })
                            r.content.on("error", function (err) {
                                reject(err);
                            })
                        }
                        else if (typeof r.content == "string") {
                            resolve(r.content)
                        }
                        else {
                            resolve(r.content.toString());
                        }
                    })

                    text = text + remarkText;
                    r.content = Buffer.from(text);
                    // if (r.headers)
                    //     r.headers["Content-Length"] = r.content.length.toString();

                    return r;
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
            requestResultTransforms: [
                async (r, c) => {
                    let text = await new Promise<string>((resolve, reject) => {
                        if (r.content instanceof stream.Readable) {
                            let buffer = Buffer.from([]);
                            r.content.on("data", (data) => {
                                buffer = Buffer.concat([buffer, data])
                            })
                            r.content.on("end", function () {
                                resolve(buffer.toString())
                            })
                            r.content.on("error", function (err) {
                                reject(err);
                            })
                        }
                        else if (typeof r.content == "string") {
                            resolve(r.content)
                        }
                        else {
                            resolve(r.content.toString());
                        }
                    })

                    text = text + remarkText;
                    r.content = Buffer.from(text);
                    // if (r.headers)
                    //     r.headers["Content-Length"] = r.content.length.toString();

                    return r;
                },
                async (r, c) => {
                    let text = await new Promise<string>((resolve, reject) => {
                        if (r.content instanceof stream.Readable) {
                            let buffer = Buffer.from([]);
                            r.content.on("data", (data) => {
                                buffer = Buffer.concat([buffer, data])
                            })
                            r.content.on("end", function () {
                                resolve(buffer.toString())
                            })
                            r.content.on("error", function (err) {
                                reject(err);
                            })
                        }
                        else if (typeof r.content == "string") {
                            resolve(r.content)
                        }
                        else {
                            resolve(r.content.toString());
                        }
                    })

                    text = text + remarkText1;
                    r.content = Buffer.from(text);
                    // if (r.headers)
                    //     r.headers["Content-Length"] = r.content.length.toString();

                    return r;
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