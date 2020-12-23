import { Logger } from "log4js";
import { WebServer } from "./web-server";
export declare type LoadPlugin = (webServer: WebServer) => void;
export declare function loadPlugins(webServer: WebServer, logger: Logger): void;
