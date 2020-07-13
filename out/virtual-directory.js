"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _physicalPath, _directories, _files, _virtualPath;
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const path = require("path");
const fs = require("fs");
const path_concat_1 = require("./path-concat");
/**
 * 虚拟文件夹
 */
class VirtualDirectory {
    constructor(physicalPath) {
        _physicalPath.set(this, void 0);
        _directories.set(this, {});
        _files.set(this, {});
        _virtualPath.set(this, null);
        if (!physicalPath)
            throw errors_1.errors.argumentNull("physicalPaths");
        // if (!fs.existsSync(physicalPath))
        //     throw errors.physicalPathNotExists(physicalPath);
        if (fs.existsSync(physicalPath) && !fs.statSync(physicalPath).isDirectory())
            throw errors_1.errors.pathNotDirectory(physicalPath);
        __classPrivateFieldSet(this, _physicalPath, physicalPath);
    }
    /** 获取当前文件夹的子文件夹 */
    directories() {
        let childDirs = __classPrivateFieldGet(this, _directories);
        this.checkPhysicalPath(__classPrivateFieldGet(this, _physicalPath));
        let names = fs.existsSync(this.physicalPath) ? fs.readdirSync(__classPrivateFieldGet(this, _physicalPath)) : [];
        names.map(name => {
            let childPhysicalPath = path_concat_1.pathConcat(__classPrivateFieldGet(this, _physicalPath), name);
            if (!fs.statSync(childPhysicalPath).isDirectory())
                return;
            if (childDirs[name] == null) {
                childDirs[name] = new VirtualDirectory(childPhysicalPath);
            }
        });
        return childDirs;
    }
    /** 该文件夹下文件的物理路径 */
    files() {
        let filePhysicalPaths = {};
        // if (!fs.existsSync(this.#physicalPath))
        //     throw errors.physicalPathNotExists(this.#physicalPath);
        let names = fs.existsSync(__classPrivateFieldGet(this, _physicalPath)) ? fs.readdirSync(__classPrivateFieldGet(this, _physicalPath)) : [];
        names.forEach(name => {
            let childPhysicalPath = path_concat_1.pathConcat(__classPrivateFieldGet(this, _physicalPath), name);
            if (fs.statSync(childPhysicalPath).isFile()) {
                filePhysicalPaths[name] = childPhysicalPath;
            }
        });
        Object.assign(filePhysicalPaths, __classPrivateFieldGet(this, _files));
        return filePhysicalPaths;
    }
    /**
     * 添加子虚拟文件夹
     * @param name 文件夹名称
     * @param physicalPath 该文件夹对应的物理路径
     */
    addDirectory(name, physicalPath) {
        if (!name)
            throw errors_1.errors.argumentNull("name");
        if (!physicalPath)
            throw errors_1.errors.argumentNull("physicalPath");
        // this.checkPhysicalPath(physicalPath);
        let dir = new VirtualDirectory(physicalPath);
        __classPrivateFieldGet(this, _directories)[name] = dir;
        return dir;
    }
    /**
     * 添加子虚拟文件
     * @param name 文件名称
     * @param physicalPath 该文件名对应的物理路径
     */
    addFile(name, physicalPath) {
        if (!name)
            throw errors_1.errors.argumentNull("name");
        if (!physicalPath)
            throw errors_1.errors.argumentNull("physicalPath");
        this.checkPhysicalPath(physicalPath);
        __classPrivateFieldGet(this, _files)[name] = physicalPath;
    }
    /** 添加虚拟路径
     * @param virtualPath 要添加的虚拟路径
     * @param physicalPath 虚拟路径所对应的物理路径
     */
    addPath(virtualPath, physicalPath) {
        if (!physicalPath)
            throw errors_1.errors.argumentNull("physicalPath");
        this.checkVirtualPath(virtualPath);
        this.checkPhysicalPath(physicalPath);
        let arr = virtualPath.split("/").filter(o => o);
        let parent = this;
        for (let i = 0; i < arr.length; i++) {
            let name = arr[i];
            let isFileName = i == arr.length - 1 && arr[arr.length - 1].indexOf(".") > 0;
            if (isFileName) {
                let file = parent.files()[name];
                if (file == null) {
                    parent.addFile(name, physicalPath);
                }
                break;
            }
            let current = parent.directory(name);
            if (current == null) {
                let directoryPhysicalPath = path_concat_1.pathConcat(parent.physicalPath, name);
                current = this.addDirectory(name, directoryPhysicalPath);
            }
            parent = current;
        }
    }
    /**
     * 获取文件夹的物理路径
     * @param virtualPath 文件夹的虚拟路径
     * @returns 文件夹的物理路径
     */
    findDirectory(virtualPath) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("path");
        if (virtualPath == "/")
            return this;
        this.checkVirtualPath(virtualPath);
        let names = virtualPath.split("/"); //.filter(o => o);
        let dirName = names[names.length - 1];
        let parentPath = names.splice(0, names.length - 1).join("/");
        if (!parentPath) {
            return this.directory(dirName);
        }
        let parentDir = this.findDirectory(parentPath);
        if (parentDir == null)
            return null;
        return parentDir.directory(dirName);
    }
    /**
     * 获取文件的物理路径
     * @param virtualPath 文件的虚拟路径
     * @returns 文件的物理路径
     */
    findFile(virtualPath) {
        let arr = virtualPath.split("/");
        let fileName = arr.pop();
        if (fileName == null)
            return null;
        let directoryPath = arr.join("/");
        let directory = directoryPath ? this.findDirectory(directoryPath) : this;
        if (directory == null)
            return null;
        return directory.files()[fileName];
    }
    /**
     * 获取当前文件夹的子文件夹
     * @param name 子文件夹的名称
     * @returns 子文件夹的虚拟文件夹
     */
    directory(name) {
        if (__classPrivateFieldGet(this, _directories)[name])
            return __classPrivateFieldGet(this, _directories)[name];
        if (__classPrivateFieldGet(this, _directories)[name])
            return __classPrivateFieldGet(this, _directories)[name];
        let physicalPath = path_concat_1.pathConcat(__classPrivateFieldGet(this, _physicalPath), name);
        if (fs.existsSync(physicalPath)) {
            return this.addDirectory(name, physicalPath);
        }
        return null;
    }
    get virtualPath() {
        return __classPrivateFieldGet(this, _virtualPath);
    }
    get physicalPath() {
        return __classPrivateFieldGet(this, _physicalPath);
    }
    checkPhysicalPath(physicalPath) {
        if (!path.isAbsolute(physicalPath))
            throw errors_1.errors.notPhysicalPath(physicalPath);
        // if (!fs.existsSync(physicalPath))
        //     throw errors.physicalPathNotExists(physicalPath);
        // if (!fs.statSync(physicalPath).isDirectory())
        //     throw errors.pathNotDirectory(physicalPath);
    }
    checkVirtualPath(virtualPath) {
        console.assert(virtualPath != null);
        if (virtualPath[0] != "/")
            throw errors_1.errors.virtualPathNotStartsWithSlash(virtualPath);
        if (virtualPath[virtualPath.length - 1] == "/")
            throw errors_1.errors.virtualPathEndsWithSlash(virtualPath);
    }
    checkFilePath(virtualPath) {
        if (virtualPath.indexOf(".") < 0)
            throw errors_1.errors.filePathNotExtention(virtualPath);
    }
}
exports.VirtualDirectory = VirtualDirectory;
_physicalPath = new WeakMap(), _directories = new WeakMap(), _files = new WeakMap(), _virtualPath = new WeakMap();
