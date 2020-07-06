import { Settings } from "./settings";
import http = require("http");
import { AddressInfo } from "net";
import url = require("url");
import { errors } from "./errors";
import { VirtualDirectory } from "./virtual-directory";

export class WebServer {
    constructor(settings: Settings) {
        if (settings == null) throw errors.argumentNull("settings");
        settings.fileProcessors = settings.fileProcessors || {};
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
            let fileExtention = this.getPathExtention(u.path);
            let fileProcessors = settings.fileProcessors || {};
            let fileProcessor = fileProcessors[fileExtention];
            if (fileProcessor) {
                let dir = settings.root.findDirectory(u.path);
                let str = fileProcessor.execute({
                    virtualPath: u.path,
                    physicalPath: dir?.physicalPath,
                });
                res.write(str);
            }
            res.end("")
        })

        return server.listen(settings.port, settings.bindIP);
    }

    private getPathExtention(path: string) {
        let fileExtention = "";
        if (path.indexOf(".") >= 0) {
            let arr = path.split(".");
            fileExtention = arr[arr.length - 1];
        }
        return fileExtention;
    }
}