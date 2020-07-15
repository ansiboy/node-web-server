export declare type FileProcessorResult = {
    statusCode?: number;
    content: string;
    contentType?: string;
};
export declare type FileProcessor = (args: {
    virtualPath: string;
    physicalPath?: string | null;
}) => FileProcessorResult | Promise<FileProcessorResult>;
