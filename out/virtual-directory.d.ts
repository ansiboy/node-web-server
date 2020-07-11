/**
 * 虚拟文件夹
 */
export declare class VirtualDirectory {
    #private;
    constructor(physicalPath: string);
    /** 获取当前文件夹的子文件夹 */
    directories(): {
        [name: string]: VirtualDirectory;
    };
    /** 该文件夹下文件的物理路径 */
    files(): {
        [name: string]: string;
    };
    /** 添加子虚拟文件夹 */
    addDirectory(name: string, physicalPath: string): VirtualDirectory;
    /** 添加子虚拟文件 */
    addFile(name: string, physicalPath: string): void;
    /**
     * 获取文件夹的物理路径
     * @param virtualPath 文件夹的虚拟路径
     * @returns 文件夹的物理路径
     */
    findDirectory(virtualPath: string): VirtualDirectory | null;
    findFile(virtualPath: string): string | null;
    /**
     * 获取当前文件夹的子文件夹
     * @param name 子文件夹的名称
     * @returns 子文件夹的虚拟文件夹
     */
    private directory;
    get virtualPath(): string | null;
    get physicalPath(): string;
    private checkPhysicalPath;
    private checkVirtualPath;
    private checkFilePath;
}
