export declare type FileProcessor = (args: {
    virtualPath: string;
    physicalPath?: string | null;
}) => {
    statusCode?: number;
    content: string;
    contentType?: string;
};
