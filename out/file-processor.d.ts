export declare type FileProcessor = (args: {
    virtualPath: string;
    physicalPath?: string | null;
}) => {
    statusCode?: number;
    content: string;
};
export declare type FileProcessors = {
    [fileExtention: string]: FileProcessor;
};
