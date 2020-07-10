import { Settings } from "./settings";
import http = require("http");
import { AddressInfo } from "net";
import url = require("url");
import { errors } from "./errors";
import { VirtualDirectory } from "./virtual-directory";
import { Content } from "./request-processor";
import { contentTypes } from "./content-types";
import { textFileProcessor } from "./file-processors/static-file";
import { staticFileRequestProcessor } from "./request-processors/static-file";

export class WebServer {

    #root: VirtualDirectory;

    constructor(settings: Settings) {
        if (settings == null) throw errors.argumentNull("settings");
        settings.root = settings.root || new VirtualDirectory(__dirname);
        this.#root = settings.root || new VirtualDirectory(__dirname);

        let s = this.start(settings);
        if (!settings.port) {
            let address = s.address() as AddressInfo;
            settings.port = address.port;
        }
    }

    get root() {
        return this.#root;
    }

    private start(settings: Settings) {
        let server = http.createServer(async (req, res) => {
            let u = url.parse(req.url || "");

            let path = u.path || "";
            let physicalPath: string | null | undefined = null;
            if (path.indexOf(".") < 0) {
                let dir = settings.root?.findDirectory(path);
                physicalPath = dir?.physicalPath;
            }
            else {
                physicalPath = settings.root?.findFile(path);
            }

            let requestProcessors = settings.requestProcessors || [staticFileRequestProcessor];
            for (let i = 0; i < requestProcessors.length; i++) {
                let processor = requestProcessors[i];
                try {
                    let r = processor({ virtualPath: path, physicalPath, });
                    if (r != null) {
                        if (r.statusCode) {
                            res.statusCode = r.statusCode;
                        }
                        if (r.contentType) {
                            res.setHeader("content-type", r.contentType);
                        }

                        this.outputContent(r.content, res);
                        return;
                    }
                }
                catch (err) {
                    this.outputError(err, res);
                    return;
                }
            }

            // 404
            this.outputError(errors.pageNotFound(path), res);
        })

        return server.listen(settings.port, settings.bindIP);
    }

    private outputContent(content: Content, res: http.ServerResponse) {
        let p = content as Promise<any>;
        if (p.then == null || p.catch == null) {
            p = Promise.resolve(p);
        }

        let r = p.then(c => {
            res.write(c);
            res.end();
        }).catch(err => {
            this.outputError(err, res);
        })

    }

    private outputError(err: Error, res: http.ServerResponse) {
        if (err == null) {
            err = new Error(`Unkonwn error because original error is null.`)
            err.name = 'nullError'
        }

        const defaultErrorStatusCode = 600;

        res.setHeader("content-type", contentTypes.applicationJSON);
        res.statusCode = err.statusCode || defaultErrorStatusCode;
        res.statusMessage = err.name;      // statusMessage 不能为中文，否则会出现 invalid chartset 的异常

        if (/^\d\d\d\s/.test(err.name)) {
            res.statusCode = Number.parseInt(err.name.substr(0, 3));
            err.name = err.name.substr(4);
        }

        let outputObject = this.errorOutputObject(err)
        let str = JSON.stringify(outputObject);
        res.write(str);
        res.end();
    }

    private errorOutputObject(err: Error) {
        let outputObject = { message: err.message, name: err.name, stack: err.stack };
        if (err.innerError) {
            (outputObject as any)['innerError'] = this.errorOutputObject(err.innerError)
        }

        return outputObject
    }


    private getPathExtention(path: string): string | null {
        let fileExtention: string | null = null;
        if (path.indexOf(".") >= 0) {
            let arr = path.split(".");
            fileExtention = arr[arr.length - 1];
        }
        return fileExtention;
    }
}