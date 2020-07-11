"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _proxyTargets;
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const errors_1 = require("../errors");
class ProxyRequestProcessor {
    constructor() {
        _proxyTargets.set(this, {});
    }
    get proxyTargets() {
        return __classPrivateFieldGet(this, _proxyTargets);
    }
    execute(args) {
        for (let key in __classPrivateFieldGet(this, _proxyTargets)) {
            let regex = new RegExp(key);
            let reqUrl = args.virtualPath;
            let arr = regex.exec(reqUrl);
            if (arr == null || arr.length == 0) {
                continue;
            }
            let proxyItem = __classPrivateFieldGet(this, _proxyTargets)[key];
            let targetUrl = proxyItem.targetUrl;
            let regex1 = /\$(\d+)/g;
            if (regex1.test(targetUrl)) {
                targetUrl = targetUrl.replace(regex1, (match, number) => {
                    if (arr == null)
                        throw errors_1.errors.unexpectedNullValue('arr');
                    return typeof arr[number] != 'undefined' ? arr[number] : match;
                });
            }
            return proxyRequest(targetUrl, args.req, args.res, {}, args.req.method);
        }
        return null;
    }
}
exports.ProxyRequestProcessor = ProxyRequestProcessor;
_proxyTargets = new WeakMap();
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
            let b = Buffer.from([]);
            response.on("data", (data) => {
                b = Buffer.concat([b, data]);
            });
            response.on("end", () => {
                resolve({ content: b });
            });
            response.on("error", err => reject(err));
            response.on("close", () => {
                reject(errors_1.errors.connectionClose());
            });
        });
        if (!req.readable) {
            reject(errors_1.errors.requestNotReadable());
        }
        req.on('data', (data) => {
            clientRequest.write(data);
        }).on('end', () => {
            clientRequest.end();
        }).on('error', (err) => {
            clientRequest.end();
            reject(err);
        });
        clientRequest.on("error", function (err) {
            // let logger = getLogger(LOG_CATEGORY_NAME, serverContext.logLevel);
            // logger.error(err);
            reject(err);
        });
    });
}
exports.proxyRequest = proxyRequest;
//# sourceMappingURL=proxy.js.map