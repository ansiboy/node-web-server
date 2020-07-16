// export type FileProcessorResult = {
//     statusCode?: number, content: Buffer, contentType?: string

import { RequestResult } from "./request-processor";

// }e
export type FileProcessor = (args: { virtualPath: string, physicalPath?: string | null }) => RequestResult | Promise<RequestResult>;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// export type FileProcessors = { [fileExtention: string]: FileProcessor };