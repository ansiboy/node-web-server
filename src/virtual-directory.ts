import { errors } from "./errors";
import path = require("path");
import fs = require("fs");
import { pathConcat } from "./path-concat";


const RootVirtualPath = "/";

/**
 * 虚拟文件夹
 */
export class VirtualDirectory {
    #physicalPath: string;
    #directories: { [name: string]: VirtualDirectory } = {};
    #files: { [name: string]: string } = {};
    #virtualPath: string;

    constructor(physicalPath: string, virtualPath: string = RootVirtualPath) {

        if (!physicalPath) throw errors.argumentNull("physicalPaths");

        // if (!fs.existsSync(physicalPath))
        //     throw errors.physicalPathNotExists(physicalPath);

        if (fs.existsSync(physicalPath) && !fs.statSync(physicalPath).isDirectory())
            throw errors.pathNotDirectory(physicalPath);


        this.#physicalPath = physicalPath;
        this.#virtualPath = virtualPath;
    }

    /** 获取当前文件夹的子文件夹 */
    directories() {
        let childDirs: { [name: string]: VirtualDirectory } = this.#directories;
        this.checkPhysicalPath(this.#physicalPath);
        let names = fs.existsSync(this.physicalPath) ? fs.readdirSync(this.#physicalPath) : [];
        names.map(name => {
            let childPhysicalPath = pathConcat(this.#physicalPath, name);
            let childVirtualPath = pathConcat(this.#virtualPath, name);
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
        // if (!fs.existsSync(this.#physicalPath))
        //     throw errors.physicalPathNotExists(this.#physicalPath);

        let names = fs.existsSync(this.#physicalPath) ? fs.readdirSync(this.#physicalPath) : [];
        names.forEach(name => {
            let childPhysicalPath = pathConcat(this.#physicalPath, name);
            if (fs.statSync(childPhysicalPath).isFile()) {
                filePhysicalPaths[name] = childPhysicalPath;
            }
        })

        Object.assign(filePhysicalPaths, this.#files);
        return filePhysicalPaths;
    }

    /** 
     * 添加子虚拟文件夹 
     * @param name 文件夹名称
     * @param physicalPath 该文件夹对应的物理路径
     */
    private addDirectory(name: string, physicalPath: string): VirtualDirectory {
        if (!name) throw errors.argumentNull("name");
        if (!physicalPath) throw errors.argumentNull("physicalPath");
        // this.checkPhysicalPath(physicalPath);

        let virtualPath = pathConcat(this.virtualPath, name);
        let dir = new VirtualDirectory(physicalPath, virtualPath);
        this.#directories[name] = dir;

        return dir;
    }

    /** 
     * 添加子虚拟文件 
     * @param name 文件名称
     * @param physicalPath 该文件名对应的物理路径
     */
    private addFile(name: string, physicalPath: string) {
        if (!name) throw errors.argumentNull("name");
        if (!physicalPath) throw errors.argumentNull("physicalPath");
        this.checkPhysicalPath(physicalPath);

        this.#files[name] = physicalPath;
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

        let arr = virtualPath.split("/").filter(o => o);

        let current: VirtualDirectory = this;
        for (let i = 0; i < arr.length; i++) {
            let name = arr[i];

            let isFileName = i == arr.length - 1 && arr[arr.length - 1].indexOf(".") > 0;
            if (isFileName) {
                let file = current.files()[name];
                if (file == null) {
                    current.addFile(name, physicalPath);
                }
                break;
            }

            let child = current.directory(name);
            if (child == null) {
                let directoryPhysicalPath = i == arr.length - 1 ? physicalPath : pathConcat(current.physicalPath, name);
                child = current.addDirectory(name, directoryPhysicalPath);
            }

            current = child;
            if (i == arr.length - 1) {
                current.#physicalPath = physicalPath;
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
    findFile(virtualPath: string) {
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
        if (this.#directories[name])
            return this.#directories[name];

        if (this.#directories[name])
            return this.#directories[name];

        let physicalPath = pathConcat(this.#physicalPath, name);
        if (fs.existsSync(physicalPath)) {
            let childVirtualPath = pathConcat(this.#virtualPath, name);
            this.#directories[name] = new VirtualDirectory(physicalPath, childVirtualPath);
            return this.#directories[name];
        }

        return null;
    }

    get virtualPath() {
        return this.#virtualPath;
    }

    get physicalPath() {
        return this.#physicalPath;
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