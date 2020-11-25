import { RequestProcessor } from "../request-processor";
declare type RequestProcessorType = {
    new (config?: any): RequestProcessor;
};
export declare class RequestProcessorCollection {
    private items;
    foreach(func: (item: RequestProcessorType) => void): void;
    add(item: RequestProcessorType): void;
    insertBefore(item: RequestProcessorType, otherItemName: string): void;
    insertAfter(item: RequestProcessorType, otherItemName: string): void;
    private getItemIndexByName;
}
export {};
