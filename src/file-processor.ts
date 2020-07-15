export type FileProcessorResult = {
    statusCode?: number, content: string, contentType?: string
}
export type FileProcessor = (args: { virtualPath: string, physicalPath?: string | null }) => FileProcessorResult | Promise<FileProcessorResult>;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// export type FileProcessors = { [fileExtention: string]: FileProcessor };