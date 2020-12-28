#!/usr/bin/env node

const yargs = require("yargs");
const path = require("path");
const fs = require("fs");
const nws = require("../out");

let defaultPort = 9868;
let defaultIP = "127.0.0.1";

function main() {

    var argv = yargs
        .describe({ p: "服务器端口" })
        .describe({ i: "服务器 IP" })
        .usage("Usage: nws <website path> -p <port> -i <ip>")
        .check((argv) => {

            if (argv._ != null && argv._[0] != null) {
                argv.d = argv._[0]
            }

            if (argv.d != undefined && typeof argv.d != "string")
                throw new Error("文件夹路径不正确");

            if (argv.i != undefined && typeof argv.i != "string")
                throw new Error("服务器 IP 不正确")

            if (!argv.d) {
                throw new Error("文件夹路径不允许为空")
            }

            if (!path.isAbsolute(argv.d))
                argv.d = path.join(process.cwd(), argv.d);

            if (!fs.existsSync(argv.d))
                throw new Error(`路径 ${argv.d} 不存在`);

            return true;
        })
        .argv;

    /** @type {nwsp.Settings} */
    let settings = {};

    settings.websiteDirectory = argv.d;
    settings.port = argv.p || settings.port || defaultPort;
    settings.bindIP = argv.i || settings.bindIP || defaultIP;

    let w = new nws.WebServer(settings);
}

main();

