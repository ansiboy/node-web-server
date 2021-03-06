import { errors } from "./errors";
import path = require("path");
import fs = require("fs");
import { pathConcat } from "./path-concat";


const RootVirtualPath = "/";

/**
 * 虚拟文件夹
 */
export class VirtualDirectory {
    private _physicalPath: string;
    private _directories: { [name: string]: VirtualDirectory } = {};
    private _files: { [name: string]: string } = {};
    private _virtualPath: string;

    constructor(physicalPath: string, virtualPath: string = RootVirtualPath) {

        if (!physicalPath) throw errors.argumentNull("physicalPaths");

        // if (!fs.existsSync(physicalPath))
        //     throw errors.physicalPathNotExists(physicalPath);

        if (fs.existsSync(physicalPath) && !fs.statSync(physicalPath).isDirectory())
            throw errors.pathNotDirectory(physicalPath);


        this._physicalPath = physicalPath;
        this._virtualPath = virtualPath;
    }

    /** 获取当前文件夹的子文件夹 */
    directories() {
        let childDirs: { [name: string]: VirtualDirectory } = this._directories;
        this.checkPhysicalPath(this._physicalPath);
        let names = fs.existsSync(this.physicalPath) ? fs.readdirSync(this._physicalPath) : [];
        names.map(name => {
            let childPhysicalPath = pathConcat(this._physicalPath, name);
            let childVirtualPath = pathConcat(this._virtualPath, name);
            if (!fs.statSync(childPhysicalPath).isDirectory())
                return;

            if (childDirs[name] == null) {
                childDirs[name] = new VirtualDirectory(childPhysicalPath, childVirtualPath);
            }
        })

        return childDirs;
    }

    /** 该文件夹下文件的物理路径 */
    files() {
        let filePhysicalPaths: { [name: string]: string } = {};
        let names = fs.existsSync(this._physicalPath) ? fs.readdirSync(this._physicalPath) : [];
        names.forEach(name => {
            let childPhysicalPath = pathConcat(this._physicalPath, name);
            if (fs.statSync(childPhysicalPath).isFile()) {
                filePhysicalPaths[name] = childPhysicalPath;
            }
        })

        Object.assign(filePhysicalPaths, this._files,);
        return filePhysicalPaths;
    }

    /** 
     * 设置子虚拟文件夹 
     * @param name 文件夹名称
     * @param physicalPath 该文件夹对应的物理路径
     */
    private setDirectory(name: string, physicalPath: string): VirtualDirectory {
        if (!name) throw errors.argumentNull("name");
        if (!physicalPath) throw errors.argumentNull("physicalPath");
        // this.checkPhysicalPath(physicalPath);

        let virtualPath = pathConcat(this.virtualPath, name);
        let dir = new VirtualDirectory(physicalPath, virtualPath);
        this._directories[name] = dir;

        return dir;
    }

    /** 
     * 设置子虚拟文件 
     * @param name 文件名称
     * @param physicalPath 该文件名对应的物理路径
     */
    private setFile(name: string, physicalPath: string) {
        if (!name) throw errors.argumentNull("name");
        if (!physicalPath) throw errors.argumentNull("physicalPath");
        this.checkPhysicalPath(physicalPath);

        this._files[name] = physicalPath;
    }

    /** 设置虚拟路径
     * @param virtualPath 要添加的虚拟路径
     * @param physicalPath 虚拟路径所对应的物理路径
     */
    setPath(virtualPath: string, physicalPath: string) {
        if (!physicalPath) throw errors.argumentNull("physicalPath");
        if (!virtualPath) throw errors.argumentNull("virtualPath");

        if (virtualPath[0] != "/")
            virtualPath = "/" + virtualPath;

        this.checkVirtualPath(virtualPath);
        this.checkPhysicalPath(physicalPath);
        if (!fs.existsSync(physicalPath))
            throw errors.physicalPathNotExists(physicalPath);

        let arr = virtualPath.split("/").filter(o => o);

        let current: VirtualDirectory = this;
        for (let i = 0; i < arr.length; i++) {
            let name = arr[i];

            // let isFileName = i == arr.length - 1 && arr[arr.length - 1].indexOf(".") >= 0;
            // if (isFileName) {
            //     current.setFile(name, physicalPath);
            //     break;
            // }
            if (i == arr.length - 1 && fs.statSync(physicalPath).isFile()) {
                current.setFile(name, physicalPath);
                break;
            }

            let child = current.directory(name);
            if (child == null) {
                let directoryPhysicalPath = i == arr.length - 1 ? physicalPath : pathConcat(current.physicalPath, name);
                child = current.setDirectory(name, directoryPhysicalPath);
            }

            current = child;
            if (i == arr.length - 1) {
                current._physicalPath = physicalPath;
            }
        }

    }

    /**
     * 获取文件夹的物理路径
     * @param virtualPath 文件夹的虚拟路径
     * @returns 文件夹的物理路径
     */
    findDirectory(virtualPath: string): VirtualDirectory | null {
        if (!virtualPath) throw errors.argumentNull("virtualPath");
        if (virtualPath[0] != "/")
            virtualPath = "/" + virtualPath;

        if (virtualPath == RootVirtualPath)
            return this;

        this.checkVirtualPath(virtualPath);

        let names = virtualPath.split("/");//.filter(o => o);
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
    findFile(virtualPath: string): string | null {
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
    private directory(name: string) {
        if (this._directories[name])
            return this._directories[name];

        if (this._directories[name])
            return this._directories[name];

        let physicalPath = pathConcat(this._physicalPath, name);
        if (fs.existsSync(physicalPath)) {
            let childVirtualPath = pathConcat(this._virtualPath, name);
            this._directories[name] = new VirtualDirectory(physicalPath, childVirtualPath);
            return this._directories[name];
        }

        return null;
    }

    get virtualPath() {
        return this._virtualPath;
    }

    get physicalPath() {
        return this._physicalPath;
    }

    private checkPhysicalPath(physicalPath: string) {
        if (!path.isAbsolute(physicalPath))
            throw errors.notPhysicalPath(physicalPath);

        // if (!fs.existsSync(physicalPath))
        //     throw errors.physicalPathNotExists(physicalPath);

        // if (!fs.statSync(physicalPath).isDirectory())
        //     throw errors.pathNotDirectory(physicalPath);

    }

    private checkVirtualPath(virtualPath: string) {
        console.assert(virtualPath != null);
        if (virtualPath[0] != "/")
            throw errors.virtualPathNotStartsWithSlash(virtualPath);

        if (virtualPath[virtualPath.length - 1] == "/")
            throw errors.virtualPathEndsWithSlash(virtualPath);
    }

    // private checkFilePath(virtualPath: string) {
    //     if (virtualPath.indexOf(".") < 0)
    //         throw errors.filePathNotExtention(virtualPath);
    // }

}