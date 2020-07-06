import { Stream } from "stream";

export interface FileProcessor {
    fileExtention: string,
    contentType: string,
    execute: (args: {
        virtualPath: string, physicalPath?: string
    }) => string | Stream,
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type FileProcessors = { [fileExtention: string]: Omit<FileProcessor, "contentType"> };