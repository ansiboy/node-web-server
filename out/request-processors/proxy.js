"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const errors_1 = require("../errors");
class ProxyRequestProcessor {
    constructor(config) {
        config = config || {};
        this.#proxyTargets = {};
        if (config.proxyTargets) {
            for (let key in config.proxyTargets) {
                if (typeof config.proxyTargets[key] == "string") {
                    this.#proxyTargets[key] = { targetUrl: config.proxyTargets[key] };
                }
                else {
                    this.#proxyTargets[key] = config.proxyTargets[key];
                }
            }
        }
    }
    #proxyTargets;
    get proxyTargets() {
        return this.#proxyTargets;
    }
    async execute(args) {
        for (let key in this.#proxyTargets) {
            let regex = new RegExp(key);
            let reqUrl = args.virtualPath;
            let arr = regex.exec(reqUrl);
            if (arr == null || arr.length == 0) {
                continue;
            }
            let proxyItem = this.#proxyTargets[key];
            let targetUrl = proxyItem.targetUrl;
            let headers = {};
            if (proxyItem.headers != null && typeof proxyItem.headers == "object") {
                headers = proxyItem.headers;
            }
            else if (proxyItem.headers != null && typeof proxyItem.headers == "function") {
                let r = proxyItem.headers(args);
                if (r instanceof Promise) {
                    headers = await r;
                }
                else {
                    headers = r;
                }
            }
            let regex1 = /\$(\d+)/g;
            if (regex1.test(targetUrl)) {
                targetUrl = targetUrl.replace(regex1, (match, number) => {
                    if (arr == null)
                        throw errors_1.errors.unexpectedNullValue('arr');
                    return typeof arr[number] != 'undefined' ? arr[number] : match;
                });
            }
            return proxyRequest(targetUrl, args.req, args.res, headers, args.req.method);
        }
        return null;
    }
}
exports.ProxyRequestProcessor = ProxyRequestProcessor;
function proxyRequest(targetUrl, req, res, headers, method) {
    return new Promise(function (resolve, reject) {
        headers = Object.assign({}, req.headers, headers || {});
        // headers = Object.assign(req.headers, headers);
        //=====================================================
        if (headers.host) {
            headers["delete-host"] = headers.host;
            // 在转发请求到 nginx 服务器,如果有 host 字段,转发失败
            delete headers.host;
        }
        //=====================================================
        let clientRequest = http.request(targetUrl, {
            method: method || req.method,
            headers: headers, timeout: 2000,
        }, function (response) {
            for (var key in response.headers) {
                res.setHeader(key, response.headers[key] || '');
            }
            res.statusCode = response.statusCode || 200;
            res.statusMessage = response.statusMessage || '';
            response.pipe(res);
            response.on("end", () => resolve());
            response.on("error", err => reject(err));
            response.on("close", () => reject(errors_1.errors.connectionClose()));
            resolve({ content: response });
        });
        if (!req.readable) {
            reject(errors_1.errors.requestNotReadable());
        }
        req.on('data', (data) => {
            clientRequest.write(data);
        }).on('end', () => {
            clientRequest.end();
        }).on("close", () => {
            clientRequest.end();
        }).on('error', (err) => {
            clientRequest.end();
            reject(err);
        });
        clientRequest.on("error", function (err) {
            reject(err);
        });
    });
}
exports.proxyRequest = proxyRequest;
