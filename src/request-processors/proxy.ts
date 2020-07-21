import { RequestProcessor, RequestContext, RequestResult } from "../request-processor";
import http = require('http');
import { errors } from "../errors";

export interface ProxyItem {
    targetUrl: string,
    headers?: { [name: string]: string } | ((requestContext: RequestContext) => { [name: string]: string } | Promise<{ [name: string]: string }>),
}

export interface ProxyConfig {
    proxyTargets: { [key: string]: ProxyItem | string };
}

export class ProxyRequestProcessor implements RequestProcessor {

    #proxyTargets: { [key: string]: ProxyItem };


    constructor(config: ProxyConfig) {
        config = config || {} as ProxyConfig;
        this.#proxyTargets = {};
        if (config.proxyTargets) {
            for (let key in config.proxyTargets) {
                if (typeof config.proxyTargets[key] == "string") {
                    this.#proxyTargets[key] = { targetUrl: config.proxyTargets[key] as string };
                }
                else {
                    this.#proxyTargets[key] = config.proxyTargets[key] as ProxyItem;
                }
            }
        }
    }

    get proxyTargets() {
        return this.#proxyTargets;
    }

    async execute(args: RequestContext) {
        for (let key in this.#proxyTargets) {
            let regex = new RegExp(key)
            let reqUrl = args.virtualPath;
            let arr = regex.exec(reqUrl)
            if (arr == null || arr.length == 0) {
                continue;
            }

            let proxyItem = this.#proxyTargets[key];
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

                // let b = Buffer.from([]);

                // response.on("data", (data) => {
                //     b = Buffer.concat([b, data]);
                // });

                // response.on("end", () => {
                //     resolve({ content: b });
                // });
                // response.on("error", err => reject(err));
                // response.on("close", () => {
                //     reject(errors.connectionClose())
                // });

                response.pipe(res);
                response.on("end", () => resolve());
                response.on("error", err => reject(err));
                response.on("close", () => reject(errors.connectionClose()));

                resolve({ content: response });
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
            // let logger = getLogger(LOG_CATEGORY_NAME, serverContext.logLevel);
            // logger.error(err);
            reject(err);
        });
    })
}

