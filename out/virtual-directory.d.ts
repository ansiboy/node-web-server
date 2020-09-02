/**
 * 虚拟文件夹
 */
export declare class VirtualDirectory {
    #private;
    constructor(physicalPath: string, virtualPath?: string);
    /** 获取当前文件夹的子文件夹 */
    directories(): {
        [name: string]: VirtualDirectory;
    };
    /** 该文件夹下文件的物理路径 */
    files(): {
        [name: string]: string;
    };
    /**
     * 添加子虚拟文件夹
     * @param name 文件夹名称
     * @param physicalPath 该文件夹对应的物理路径
     */
    private addDirectory;
    /**
     * 添加子虚拟文件
     * @param name 文件名称
     * @param physicalPath 该文件名对应的物理路径
     */
    private addFile;
    /** 设置虚拟路径
     * @param virtualPath 要添加的虚拟路径
     * @param physicalPath 虚拟路径所对应的物理路径
     */
    setPath(virtualPath: string, physicalPath: string): void;
    /**
     * 获取文件夹的物理路径
     * @param virtualPath 文件夹的虚拟路径
     * @returns 文件夹的物理路径
     */
    findDirectory(virtualPath: string): VirtualDirectory | null;
    /**
     * 获取文件的物理路径
     * @param virtualPath 文件的虚拟路径
     * @returns 文件的物理路径
     */
    findFile(virtualPath: string): string | null;
    /**
     * 获取当前文件夹的子文件夹
     * @param name 子文件夹的名称
     * @returns 子文件夹的虚拟文件夹
     */
    private directory;
    get virtualPath(): string;
    get physicalPath(): string;
    private checkPhysicalPath;
    private checkVirtualPath;
}
