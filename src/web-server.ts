import { Settings } from "./settings";
import http = require("http");
import { AddressInfo } from "net";
import url = require("url");
import { errors } from "./errors";
import { VirtualDirectory } from "./virtual-directory";
import { defaultFileProcessors } from "./file-processors";

export class WebServer {
    constructor(settings: Settings) {
        if (settings == null) throw errors.argumentNull("settings");
        settings.fileProcessors = Object.assign({}, defaultFileProcessors, settings.fileProcessors || {});
        settings.root = settings.root || new VirtualDirectory(__dirname);

        let s = this.start(settings);
        if (!settings.port) {
            let address = s.address() as AddressInfo;
            settings.port = address.port;
        }
    }

    private start(settings: Settings) {
        let server = http.createServer(async (req, res) => {
            let u = url.parse(req.url || "");

            let path = u.path || "";
            let fileExtention = this.getPathExtention(path);
            let fileProcessors = settings.fileProcessors || {};
            let fileProcessor = fileExtention ? fileProcessors[fileExtention] : null;
            if (fileProcessor) {
                // let dir = u.path.indexOf(".") < 0 ? settings.root.findDirectory(u.path) : settings.root.findFile(u.path);
                let physicalPath: string | null | undefined = null;
                if (path.indexOf(".") < 0) {
                    let dir = settings.root?.findDirectory(path);
                    physicalPath = dir?.physicalPath;
                }
                else {
                    physicalPath = settings.root?.findFile(path);
                }
                let r = fileProcessor({
                    virtualPath: path,
                    physicalPath: physicalPath,
                });
                res.write(r.content);
                if (r.statusCode) {
                    res.statusCode = r.statusCode;
                }
            }
            res.end("")
        })

        return server.listen(settings.port, settings.bindIP);
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