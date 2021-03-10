import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import http = require('http');
import { errors } from "../errors";
import { processorPriorities } from "./priority";

export interface ProxyItem {
    /** 转发请求的目标地址 */
    targetUrl: string,
    /** HTTP header 信息 */
    headers?: { [name: string]: string } | ((requestContext: RequestContext) => { [name: string]: string } | Promise<{ [name: string]: string }>),
}

interface Options {
    /** 转发目标 */
    proxyTargets: { [key: string]: ProxyItem | string };
}

export class ProxyRequestProcessor implements RequestProcessor {

    priority = processorPriorities.ProxyRequestProcessor;
    private options = { proxyTargets: {} };

    constructor() {
    }

    get proxyTargets(): Options["proxyTargets"] {
        return this.options.proxyTargets;
    }
    set proxyTargets(value) {
        this.options.proxyTargets = value || {};
    }

    async execute(args: RequestContext) {
        for (let key in this.proxyTargets) {
            let regex = new RegExp(key)
            let reqUrl = args.req.url || "";
            let arr = regex.exec(reqUrl)
            if (arr == null || arr.length == 0) {
                continue;
            }

            let item = this.proxyTargets[key];
            let proxyItem: ProxyItem = typeof item == "string" ? { targetUrl: item } : item;
            let targetUrl = proxyItem.targetUrl;
            let headers: http.IncomingMessage["headers"] = {};
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
                    if (arr == null) throw errors.unexpectedNullValue('arr')

                    return typeof arr[number] != 'undefined' ? arr[number] : match;
                })
            }

            return proxyRequest(targetUrl, args.req, args.res, headers, args.req.method);
        }

        return null;
    }
}


export function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse,
    headers: http.IncomingMessage["headers"], method?: string): Promise<RequestResult> {
    return new Promise<RequestResult>(function (resolve, reject) {
        headers = Object.assign({}, req.headers, headers || {});
        // headers = Object.assign(req.headers, headers);
        //=====================================================
        if (headers.host) {
            headers["delete-host"] = headers.host;
            // 在转发请求到 nginx 服务器,如果有 host 字段,转发失败
            delete headers.host;
        }

        //=====================================================
        let clientRequest = http.request(targetUrl,
            {
                method: method || req.method,
                headers: headers, timeout: 2000,
            },
            function (response) {
                for (var key in response.headers) {
                    res.setHeader(key, response.headers[key] || '');
                }
                res.statusCode = response.statusCode || 200;
                res.statusMessage = response.statusMessage || '';

                response.on("error", err => reject(err));
                response.on("close", () => reject(errors.connectionClose()));
                response.on("end", () => {
                    let headers = Object.assign({}, response.headers);
                    if (headers["content-length"])
                        delete headers["content-length"];

                    resolve({
                        content: buffer, statusCode: response.statusCode || 200,
                        headers
                    });
                });
                response.on("error", err => reject(err));

                let buffer = Buffer.from([]);
                response.on("data", function (data) {
                    buffer = Buffer.concat([buffer, data])
                })

                // resolve({
                //     content: response, statusCode: response.statusCode || 200,
                //     headers: response.headers,
                // });
            }
        );

        if (!req.readable) {
            reject(errors.requestNotReadable());
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
    })
}

