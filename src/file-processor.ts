// export type FileProcessorResult = {
//     statusCode?: number, content: Buffer, contentType?: string

import { RequestResult, RequestContext } from "./request-processor";

// }e
export type FileProcessor = (args: { virtualPath: string, physicalPath: string }, ctx: RequestContext) => RequestResult | Promise<RequestResult>;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// export type FileProcessors = { [fileExtention: string]: FileProcessor };