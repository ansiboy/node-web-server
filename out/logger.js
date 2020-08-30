"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
const errors_1 = require("./errors");
let categories = {
    default: {
        appenders: ['console'], level: 'debug',
    }
};
let layout = {
    type: "pattern",
    pattern: "[%d{yyyy-MM-dd hh:mm:ss}] [%p] {%x{projectName}} - %m%n%",
    tokens: {
        projectName
    }
};
let appenders = {
    console: {
        type: "console",
        layout
    }
};
function projectName(logEvent) {
    let arr = logEvent.categoryName.split("-");
    console.assert(arr.length > 1, `Category name format is incorrect.Category name is ${logEvent.categoryName}`);
    arr.pop();
    let r = arr.join("-");
    return r;
}
log4js.configure({ appenders, categories });
function getLogger(categoryName, logLevel, filePath) {
    if (!categoryName)
        throw errors_1.errors.arugmentNull("categoryName");
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
            };
            appenderNames.push(filePath);
        }
        categories[categoryName] = {
            appenders: appenderNames, level: logLevel
        };
        log4js.configure({ appenders, categories });
    }
    let logger = log4js.getLogger(categoryName);
    return logger;
}
exports.getLogger = getLogger;
