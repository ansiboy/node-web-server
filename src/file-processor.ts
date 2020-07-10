export type FileProcessor = (args: { virtualPath: string, physicalPath?: string | null }) => { statusCode?: number, content: string, contentType?: string };

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type FileProcessors = { [fileExtention: string]: FileProcessor };