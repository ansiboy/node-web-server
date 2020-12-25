import { RequestProcessor } from "../request-processor";
import { Callback } from "maishu-toolkit";
declare type RequestProcessorType<T extends RequestProcessor> = {
    new (config?: any): T;
};
export declare class RequestProcessorTypeCollection {
    private items;
    added: Callback<{
        item: RequestProcessor;
    }>;
    constructor(items?: RequestProcessor[]);
    add(item: RequestProcessor): void;
    item(index: number): RequestProcessor;
    get length(): number;
    find<T extends RequestProcessor>(type: RequestProcessorType<T>): T;
}
export {};
