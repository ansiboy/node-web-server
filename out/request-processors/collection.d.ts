import { RequestProcessor } from "../request-processor";
declare type RequestProcessorType = {
    new (config?: any): RequestProcessor;
};
export declare class RequestProcessorTypeCollection {
    private items;
    map: <U>(callbackfn: (value: RequestProcessorType, index: number, array: RequestProcessorType[]) => U, thisArg?: any) => U[];
    foreach(func: (item: RequestProcessorType) => void): void;
    add(item: RequestProcessorType): void;
    addRange(items: RequestProcessorType[]): void;
    insertBefore(item: RequestProcessorType, otherItemName: string): void;
    insertAfter(item: RequestProcessorType, otherItemName: string): void;
    private getItemIndexByName;
}
export {};
