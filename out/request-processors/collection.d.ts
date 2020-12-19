import { RequestProcessor } from "../request-processor";
export declare class RequestProcessorTypeCollection {
    private items;
    constructor(items?: RequestProcessor[]);
    add(item: RequestProcessor): void;
    foreach(func: (item: RequestProcessor) => Promise<any | void>): Promise<void>;
    filter(predicate: (item: RequestProcessor) => boolean): RequestProcessorTypeCollection;
    item(index: number): RequestProcessor;
    get length(): number;
}
