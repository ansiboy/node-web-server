import { RequestProcessor, Content, RequestContext, ExecuteResult } from "../request-processor";
import http = require('http');
import { errors } from "../errors";

export interface ProxyItem {
    targetUrl: string,
    // headers?: { [name: string]: string } | (() => { [name: string]: string } | Promise<{ [name: string]: string }>),
    // response?: (proxResponse: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse) => void,
}


export class ProxyRequestProcessor implements RequestProcessor {

    #proxyTargets: { [key: string]: ProxyItem } = {};

    constructor() {

    }

    get proxyTargets() {
        return this.#proxyTargets;
    }

    execute(args: RequestContext): Promise<ExecuteResult> | null {

        for (let key in this.#proxyTargets) {
            let regex = new RegExp(key)
            let reqUrl = args.virtualPath;
            let arr = regex.exec(reqUrl)
            if (arr == null || arr.length == 0) {
                continue;
            }

            let proxyItem = this.#proxyTargets[key];
            let targetUrl = proxyItem.targetUrl;

            let regex1 = /\$(\d+)/g;
            if (regex1.test(targetUrl)) {
                targetUrl = targetUrl.replace(regex1, (match, number) => {
                    if (arr == null) throw errors.unexpectedNullValue('arr')

                    return typeof arr[number] != 'undefined' ? arr[number] : match;
                })
            }

            return proxyRequest(targetUrl, args.req, args.res, {}, args.req.method);
        }

        return null;
    }


}


export function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse,
    headers: http.IncomingMessage["headers"], method?: string): Promise<ExecuteResult> {
    return new Promise<ExecuteResult>(function (resolve, reject) {
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

                let b = Buffer.from([]);

                response.on("data", (data) => {
                    b = Buffer.concat([b, data]);
                });

                response.on("end", () => {
                    resolve({ content: b });
                });
                response.on("error", err => reject(err));
                response.on("close", () => {
                    reject(errors.connectionClose())
                });
            }
        );

        if (!req.readable) {
            reject(errors.requestNotReadable());
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
    })
}

