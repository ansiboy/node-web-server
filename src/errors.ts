import { StatusCode } from "./status-code";

export let errors = {
    arugmentNull(argumentName: string) {
        let msg = `Argument ${argumentName} can not be null or empty.`;
        let error = new Error(msg);
        let name: keyof typeof errors = "argumentNull";
        error.name = name;
        return error;
    },
    filePathNotExtention(virtualPath: string) {
        let msg = `File path '${virtualPath}' has not a extention name.`;
        let error = new Error(msg);
        let name: keyof typeof errors = "filePathNotExtention";
        error.name = name;
        return error;
    },
    vitualPathRequirePhysicalPath(virtualPath: string, physicalPath: string) {
        let msg = `The physical path '${physicalPath}' of virtual path '${virtualPath}' is not a physical path.`
        let error = new Error(msg);
        let name: keyof typeof errors = "vitualPathRequirePhysicalPath";
        error.name = name;
        return error
    },
    notPhysicalPath(physicalPath: string) {
        let msg = `Path '${physicalPath}' is not a physical path.`
        let error = new Error(msg);
        let name: keyof typeof errors = "notPhysicalPath";
        error.name = name;
        return error
    },
    argumentNull(argumentName: string) {
        let error = new Error(`Argument ${argumentName} cannt be null or emtpy.`);
        let name: keyof typeof errors = "argumentNull";
        error.name = name;
        return error;
    },
    argumentFieldNull(fieldName: string, argumentName: string) {
        let msg = `The ${fieldName} field of ${argumentName} cannt be null.`;
        let error = new Error(msg);
        let name = "argumentFieldNull";
        error.name = name;
        return error;
    },
    argumentTypeIncorrect(argumentName: string, expectedType: string) {
        let msg = `Argument ${argumentName} type error, expected type is ${expectedType}.`;
        let error = new Error(msg);
        let name: keyof typeof errors = "argumentTypeIncorrect";
        error.name = name;
        return error;
    },
    arrayEmpty(argumentName: string) {
        let error = new Error(`Array ${argumentName} can not be emtpy.`);
        let name: keyof typeof errors = "arrayEmpty";
        error.name = name;
        return error;
    },
    // virtualPathStartsWithSlash(path: string) {
    //     let error = new Error(`Child directory path can not starts with slash, path is ${path}.`);
    //     let name: keyof typeof errors = "virtualPathStartsWithSlash";
    //     error.name = name;
    //     return error;
    // },
    virtualPathNotStartsWithSlash(path: string) {
        let error = new Error(`Child directory path is not starts with slash, path is ${path}.`);
        let name: keyof typeof errors = "virtualPathNotStartsWithSlash";
        error.name = name;
        return error;
    },
    virtualPathEndsWithSlash(path: string) {
        let error = new Error(`Child directory path can not ends with slash, path is ${path}.`);
        let name: keyof typeof errors = "virtualPathEndsWithSlash";
        error.name = name;
        return error;
    },
    directoryNotExists(path: string) {
        let error = new Error(`Directory ${path} is not exists.`);
        let name: keyof typeof errors = "directoryNotExists";
        error.name = name;
        return error;
    },
    directoryExists(path: string) {
        let error = new Error(`Directory ${path} is exists.`);
        let name: keyof typeof errors = "directoryExists";
        error.name = name;
        return error;
    },
    physicalPathNotExists(physicalPath: string) {
        let error = new Error(`Directory ${physicalPath} is not exists.`);
        let name: keyof typeof errors = "physicalPathNotExists";
        error.name = name;
        return error;
    },
    pathExists(path: string) {
        let error = new Error(`Path '${path}' is exists.`);
        let name: keyof typeof errors = "pathExists";
        error.name = name;
        return error;
    },
    pathNotDirectory(path: string) {
        let error = new Error(`Path '${path}' is not a directory.`);
        let name: keyof typeof errors = "pathNotDirectory";
        error.name = name;
        return error;
    },
    pathNotFile(path: string) {
        let error = new Error(`Path '${path}' is not a file.`);
        let name: keyof typeof errors = "pathNotFile";
        error.name = name;
        return error;
    },
    physicalPathExists(physicalPath: string, dirName: string) {
        let error = new Error(`Physical path '${physicalPath}' is exists in directory '${dirName}'.`);
        let name: keyof typeof errors = "physicalPathExists";
        error.name = name;
        return error;
    },
    invalidVirtualPath(virtualPath: string) {
        let error = new Error(`Path '${virtualPath}' is a invalid path.`);
        let name: keyof typeof errors = "invalidVirtualPath";
        error.name = name;
        return error;
    },
    fileNotFound(virtualPath: string, searchIn: string[]) {
        let error = new Error(`File '${virtualPath}' not found in the directories ${searchIn.join(",")}.`);
        let name: keyof typeof errors = "fileNotFound";
        error.name = name;
        return error;
    },
    directoryNotFound(virtualPath: string, searchIn: string[]) {
        let error = new Error(`File '${virtualPath}' not found in the directories ${searchIn.join(",")}.`);
        let name: keyof typeof errors = "directoryNotExists";
        error.name = name;
        return error;
    },
    pageNotFound(path: string) {
        let msg = `Path '${path}' not found.`;
        let name: keyof typeof errors = "pageNotFound";
        let error = new Error(msg);
        error.name = name;
        error.statusCode = StatusCode.NotFound;
        return error;
    },
    fileTypeNotSupport(ext: string) {
        let msg = `File extention ${ext} is not supported.`;
        let name: keyof typeof errors = "fileTypeNotSupport";
        let error = new Error(msg);
        error.name = name;
        error.statusCode = StatusCode.UnsupportedMediaType;
        return error;
    },
    connectionClose() {
        let msg = `Connection close.`;
        let error = new Error(msg);
        let name: keyof typeof errors = "connectionClose";
        error.name = name;
        return error;
    },
    requestNotReadable() {
        let msg = `The request is not readable.`;
        let error = new Error(msg);
        let name: keyof typeof errors = "requestNotReadable";
        error.name = name;
        return error;
    },
    unexpectedNullValue(variableName: string) {
        let msg = `Variable ${variableName} value is null.`
        let error = new Error(msg)
        let name: keyof typeof errors = "unexpectedNullValue";
        error.name = name;
        return error
    },
    contentTransformResultNull() {
        let msg = `Result of content transform is null.`;
        let error = new Error(msg);
        let name: keyof typeof errors = "contentTransformResultNull";
        error.name = name;
        return error;
    },
    requestProcessorTypeExists(name: string) {
        let msg = `Request processor type named '${name}' is exists.`;
        let error = new Error(msg);
        let errorName: keyof typeof errors = "requestProcessorTypeExists";
        error.name = errorName;
        return error;
    },
    requestProcessorTypeNotExists(name: string) {
        let msg = `Request processor type named '${name}' is not exists.`;
        let error = new Error(msg);
        let errorName: keyof typeof errors = "requestProcessorTypeExists";
        error.name = errorName;
        return error;
    },
    notSettingsField(name: string) {
        let msg = `Field ${name} is not a field of settings.`;
        let error = new Error(msg);
        let errorName: keyof typeof errors = "notSettingsField";
        error.name = errorName;
        return error;
    }
}