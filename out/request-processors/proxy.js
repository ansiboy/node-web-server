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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
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
    constructor(config) {
        _proxyTargets.set(this, void 0);
        config = config || {};
        __classPrivateFieldSet(this, _proxyTargets, {});
        if (config.proxyTargets) {
            for (let key in config.proxyTargets) {
                if (typeof config.proxyTargets[key] == "string") {
                    __classPrivateFieldGet(this, _proxyTargets)[key] = { targetUrl: config.proxyTargets[key] };
                }
                else {
                    __classPrivateFieldGet(this, _proxyTargets)[key] = config.proxyTargets[key];
                }
            }
        }
    }
    get proxyTargets() {
        return __classPrivateFieldGet(this, _proxyTargets);
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let key in __classPrivateFieldGet(this, _proxyTargets)) {
                let regex = new RegExp(key);
                let reqUrl = args.virtualPath;
                let arr = regex.exec(reqUrl);
                if (arr == null || arr.length == 0) {
                    continue;
                }
                let proxyItem = __classPrivateFieldGet(this, _proxyTargets)[key];
                let targetUrl = proxyItem.targetUrl;
                let headers = {};
                if (proxyItem.headers != null && typeof proxyItem.headers == "object") {
                    headers = proxyItem.headers;
                }
                else if (proxyItem.headers != null && typeof proxyItem.headers == "function") {
                    let r = proxyItem.headers(args);
                    if (r instanceof Promise) {
                        headers = yield r;
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
        });
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
