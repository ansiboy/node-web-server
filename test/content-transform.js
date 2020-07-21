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
const assert = require("assert");
const stream = require("stream");
const path_concat_1 = require("../out/path-concat");
describe("content-transform", function () {
    let remarkText = "\r\n// Hello Word";
    let fileText = common_1.readFile(path_concat_1.pathConcat(common_1.websitePhysicalPath, "index.js"));
    let remarkText1 = "\r\n// Hello Node Web Server";
    it("sync content transform", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let w = common_1.createWebServer({
                requestResultTransforms: [
                    (r, c) => __awaiter(this, void 0, void 0, function* () {
                        let text = yield new Promise((resolve, reject) => {
                            if (r.content instanceof stream.Readable) {
                                let buffer = Buffer.from([]);
                                r.content.on("data", (data) => {
                                    buffer = Buffer.concat([buffer, data]);
                                });
                                r.content.on("end", function () {
                                    resolve(buffer.toString());
                                });
                                r.content.on("error", function (err) {
                                    reject(err);
                                });
                            }
                            else if (typeof r.content == "string") {
                                resolve(r.content);
                            }
                            else {
                                resolve(r.content.toString());
                            }
                        });
                        text = text + remarkText;
                        r.content = text;
                        return r;
                    })
                ]
            });
            let b = common_1.createBrowser();
            let url = `http://127.0.0.1:${w.port}/index.js`;
            yield b.visit(url);
            let target = fileText + remarkText;
            assert.equal(b.source, target);
        });
    });
    it("async content transform", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let w = common_1.createWebServer({
                requestResultTransforms: [
                    (r, c) => __awaiter(this, void 0, void 0, function* () {
                        let text = yield new Promise((resolve, reject) => {
                            if (r.content instanceof stream.Readable) {
                                let buffer = Buffer.from([]);
                                r.content.on("data", (data) => {
                                    buffer = Buffer.concat([buffer, data]);
                                });
                                r.content.on("end", function () {
                                    resolve(buffer.toString());
                                });
                                r.content.on("error", function (err) {
                                    reject(err);
                                });
                            }
                            else if (typeof r.content == "string") {
                                resolve(r.content);
                            }
                            else {
                                resolve(r.content.toString());
                            }
                        });
                        text = text + remarkText;
                        r.content = Buffer.from(text);
                        // if (r.headers)
                        //     r.headers["Content-Length"] = r.content.length.toString();
                        return r;
                    })
                ]
            });
            let b = common_1.createBrowser();
            let url = `http://127.0.0.1:${w.port}/index.js`;
            yield b.visit(url);
            let target = fileText + remarkText;
            assert.equal(b.source, target);
        });
    });
    it("multi content transform", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let w = common_1.createWebServer({
                requestResultTransforms: [
                    (r, c) => __awaiter(this, void 0, void 0, function* () {
                        let text = yield new Promise((resolve, reject) => {
                            if (r.content instanceof stream.Readable) {
                                let buffer = Buffer.from([]);
                                r.content.on("data", (data) => {
                                    buffer = Buffer.concat([buffer, data]);
                                });
                                r.content.on("end", function () {
                                    resolve(buffer.toString());
                                });
                                r.content.on("error", function (err) {
                                    reject(err);
                                });
                            }
                            else if (typeof r.content == "string") {
                                resolve(r.content);
                            }
                            else {
                                resolve(r.content.toString());
                            }
                        });
                        text = text + remarkText;
                        r.content = Buffer.from(text);
                        // if (r.headers)
                        //     r.headers["Content-Length"] = r.content.length.toString();
                        return r;
                    }),
                    (r, c) => __awaiter(this, void 0, void 0, function* () {
                        let text = yield new Promise((resolve, reject) => {
                            if (r.content instanceof stream.Readable) {
                                let buffer = Buffer.from([]);
                                r.content.on("data", (data) => {
                                    buffer = Buffer.concat([buffer, data]);
                                });
                                r.content.on("end", function () {
                                    resolve(buffer.toString());
                                });
                                r.content.on("error", function (err) {
                                    reject(err);
                                });
                            }
                            else if (typeof r.content == "string") {
                                resolve(r.content);
                            }
                            else {
                                resolve(r.content.toString());
                            }
                        });
                        text = text + remarkText1;
                        r.content = Buffer.from(text);
                        // if (r.headers)
                        //     r.headers["Content-Length"] = r.content.length.toString();
                        return r;
                    })
                ]
            });
            let b = common_1.createBrowser();
            let url = `http://127.0.0.1:${w.port}/index.js`;
            yield b.visit(url);
            let target = fileText + remarkText + remarkText1;
            assert.equal(b.source, target);
        });
    });
});
