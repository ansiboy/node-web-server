import { Logger } from "log4js";
import * as path from "path";
import { WebServer } from "./web-server";

export type LoadPlugin = (webServer: WebServer) => void;

export function loadPlugins(webServer: WebServer, logger: Logger,) {

    let rootDirectory = webServer.websiteDirectory;
    let nodeModulesDir = rootDirectory.findDirectory("node_modules");
    if (nodeModulesDir == null) {
        logger.warn(`Node_modules directory is not exists in the root directory '${rootDirectory.physicalPath}'.`)
        return;
    }

    let pluginNameRegex = new RegExp("\\S+-nws-")
    let dirs = nodeModulesDir.directories();
    for (let name in dirs) {
        if (!pluginNameRegex.test(name)) {
            continue;
        }

        let packagePhysicalPath = dirs[name].findFile("package.json");
        if (!packagePhysicalPath) {
            logger.warn(`File package.json is not exists in the directory ${packagePhysicalPath}.`);
            continue;
        }

        let pkg = require(packagePhysicalPath);
        let mainPath = pkg.main || "index.js";
        if (!path.isAbsolute(mainPath))
            mainPath = path.join(dirs[name].physicalPath, mainPath);

        let mod = require(mainPath);
        if (mod == null) {
            logger.warn(`Load package '${pkg.name}' fail.`);
            continue;
        }

        if (mod.default == null) {
            logger.warn(`Package '${pkg.name}' has not a default field, is has a default export?.`);
            continue;
        }

        if (typeof mod.default != "function") {
            logger.warn(`Package '${pkg.name}' default export is not a function, require a function.`);
            continue;
        }

        let func = mod.default as LoadPlugin;
        func(webServer);
    }

}