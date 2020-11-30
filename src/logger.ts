import log4js = require("log4js");
import { errors } from "./errors";
import { pathConcat } from "./path-concat";

let categories: log4js.Configuration["categories"] = {
    default: {
        appenders: ['console'], level: 'debug',
    }
}

let layout: log4js.PatternLayout = {
    type: "pattern",
    pattern: "[%d{yyyy-MM-dd hh:mm:ss}] [%p] {%x{projectName}} - %m%n%",
    tokens: {
        projectName
    }
}

let appenders: log4js.Configuration["appenders"] = {
    console: {
        type: "console",
        layout
    }
}

function projectName(logEvent: log4js.LoggingEvent) {
    let arr = logEvent.categoryName.split("-");
    console.assert(arr.length > 1, `Category name format is incorrect.Category name is ${logEvent.categoryName}`);
    arr.pop();
    let r = arr.join("-");
    return r;
}

log4js.configure({ appenders, categories });

export type LogLevel = keyof Pick<log4js.Logger, 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'> | "all" | "off" | 'mark';

export function getLogger(categoryName: string, logLevel?: LogLevel, filePath?: string) {

    if (!categoryName) throw errors.arugmentNull("categoryName");

    if (logLevel == null)
        logLevel = 'all';

    categoryName = `${categoryName}-${logLevel}`;
    if (categories[categoryName] == null) {
        let appenderNames = ["console"];

        if (filePath && appenders[filePath] == null) {
            appenders[filePath] = {
                type: "file",
                filename: filePath,
                layout
            }
            appenderNames.push(filePath);
        }

        categories[categoryName] = {
            appenders: appenderNames, level: logLevel
        }

        log4js.configure({ appenders, categories });
    }

    let logger = log4js.getLogger(categoryName);
    return logger;
}