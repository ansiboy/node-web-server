"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const status_code_1 = require("./status-code");
exports.errors = {
    filePathNotExtention(virtualPath) {
        let msg = `File path has not a extention name.`;
        let error = new Error(msg);
        let name = "filePathNotExtention";
        error.name = name;
        return error;
    },
    vitualPathRequirePhysicalPath(virtualPath, physicalPath) {
        let msg = `The physical path '${physicalPath}' of virtual path '${virtualPath}' is not a physical path.`;
        let error = new Error(msg);
        let name = "vitualPathRequirePhysicalPath";
        error.name = name;
        return error;
    },
    notPhysicalPath(physicalPath) {
        let msg = `Path '${physicalPath}' is not a physical path.`;
        let error = new Error(msg);
        let name = "notPhysicalPath";
        error.name = name;
        return error;
    },
    argumentNull(argumentName) {
        let error = new Error(`Argument ${argumentName} cannt be null or emtpy.`);
        let name = "argumentNull";
        error.name = name;
        return error;
    },
    argumentFieldNull(fieldName, argumentName) {
        let msg = `The ${fieldName} field of ${argumentName} cannt be null.`;
        let error = new Error(msg);
        let name = "argumentFieldNull";
        error.name = name;
        return error;
    },
    argumentTypeIncorrect(argumentName, expectedType) {
        let msg = `Argument ${argumentName} type error, expected type is ${expectedType}.`;
        let error = new Error(msg);
        let name = "argumentTypeIncorrect";
        error.name = name;
        return error;
    },
    arrayEmpty(argumentName) {
        let error = new Error(`Array ${argumentName} can not be emtpy.`);
        let name = "arrayEmpty";
        error.name = name;
        return error;
    },
    // virtualPathStartsWithSlash(path: string) {
    //     let error = new Error(`Child directory path can not starts with slash, path is ${path}.`);
    //     let name: keyof typeof errors = "virtualPathStartsWithSlash";
    //     error.name = name;
    //     return error;
    // },
    virtualPathNotStartsWithSlash(path) {
        let error = new Error(`Child directory path is not starts with slash, path is ${path}.`);
        let name = "virtualPathNotStartsWithSlash";
        error.name = name;
        return error;
    },
    virtualPathEndsWithSlash(path) {
        let error = new Error(`Child directory path can not ends with slash, path is ${path}.`);
        let name = "virtualPathEndsWithSlash";
        error.name = name;
        return error;
    },
    directoryNotExists(path) {
        let error = new Error(`Directory ${path} is not exists.`);
        let name = "directoryNotExists";
        error.name = name;
        return error;
    },
    directoryExists(path) {
        let error = new Error(`Directory ${path} is exists.`);
        let name = "directoryExists";
        error.name = name;
        return error;
    },
    physicalPathNotExists(physicalPath) {
        let error = new Error(`Directory ${physicalPath} is not exists.`);
        let name = "physicalPathNotExists";
        error.name = name;
        return error;
    },
    pathExists(path) {
        let error = new Error(`Path '${path}' is exists.`);
        let name = "pathExists";
        error.name = name;
        return error;
    },
    pathNotDirectory(path) {
        let error = new Error(`Path '${path}' is not a directory.`);
        let name = "pathNotDirectory";
        error.name = name;
        return error;
    },
    pathNotFile(path) {
        let error = new Error(`Path '${path}' is not a file.`);
        let name = "pathNotFile";
        error.name = name;
        return error;
    },
    physicalPathExists(physicalPath, dirName) {
        let error = new Error(`Physical path '${physicalPath}' is exists in directory '${dirName}'.`);
        let name = "physicalPathExists";
        error.name = name;
        return error;
    },
    invalidVirtualPath(virtualPath) {
        let error = new Error(`Path '${virtualPath}' is a invalid path.`);
        let name = "invalidVirtualPath";
        error.name = name;
        return error;
    },
    fileNotFound(virtualPath, searchIn) {
        let error = new Error(`File '${virtualPath}' not found in the directories ${searchIn.join(",")}.`);
        let name = "fileNotFound";
        error.name = name;
        return error;
    },
    directoryNotFound(virtualPath, searchIn) {
        let error = new Error(`File '${virtualPath}' not found in the directories ${searchIn.join(",")}.`);
        let name = "directoryNotExists";
        error.name = name;
        return error;
    },
    pageNotFound(path) {
        let msg = `Path '${path}' not found.`;
        let name = "pageNotFound";
        let error = new Error(msg);
        error.name = name;
        error.statusCode = status_code_1.StatusCode.NotFound;
        return error;
    },
    fileTypeNotSupport(ext) {
        let msg = `File extention ${ext} is not supported.`;
        let name = "filePathNotExtention";
        let error = new Error(msg);
        error.name = name;
        error.statusCode = status_code_1.StatusCode.UnsupportedMediaType;
        return error;
    },
    connectionClose() {
        let msg = `Connection close.`;
        let error = new Error(msg);
        let name = "connectionClose";
        error.name = name;
        return error;
    },
    requestNotReadable() {
        let msg = `The request is not readable.`;
        let error = new Error(msg);
        let name = "requestNotReadable";
        error.name = name;
        return error;
    },
    unexpectedNullValue(variableName) {
        let msg = `Variable ${variableName} value is null.`;
        let error = new Error(msg);
        let name = "unexpectedNullValue";
        error.name = name;
        return error;
    },
    contentTransformResultNull() {
        let msg = `Result of content transform is null.`;
        let error = new Error(msg);
        let name = "contentTransformResultNull";
        error.name = name;
        return error;
    }
};
