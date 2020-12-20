import { errors } from "../errors";
import { RequestProcessor } from "../request-processor";
import { processorPriorities } from "./priority";

type RequestProcessorType<T extends RequestProcessor> = { new(config?: any): T };


export class RequestProcessorTypeCollection {
    private items: RequestProcessor[] = [];

    constructor(items?: RequestProcessor[]) {
        if (items != null) {
            items.forEach((o) => this.add(o));
        }
    }

    add(item: RequestProcessor) {
        if (item == null)
            throw errors.argumentNull("item");

        if (item.priority == null)
            item.priority = processorPriorities.Default;

        let nextItemIndex: number | null = null;
        for (let i = 0; i < this.items.length; i++) {
            let priority = this.items[i].priority;
            if (priority == null)
                break;

            if (priority > item.priority) {
                nextItemIndex = i;
                break;
            }
        }

        if (nextItemIndex != null) {
            this.items.splice(nextItemIndex, 0, item);
        }
        else {
            this.items.push(item);
        }
    }

    async foreach(func: (item: RequestProcessor) => Promise<any | void>) {
        if (!func) throw errors.argumentNull("func");

        for (let i = 0; i < this.items.length; i++) {
            let r = func(this.items[i]);
            if (r != null && r.then != null && r.catch != null) {
                await r;
            }
        }
    }

    item(index: number) {
        return this.items[index];
    }

    get length() {
        return this.items.length;
    }

    find<T extends RequestProcessor>(type: RequestProcessorType<T>): T {
        let item = this.items.filter(o => o instanceof type)[0] as T;
        return item;
    }

    // map = this.items.map;

    // foreach(func: (item: RequestProcessorType) => void) {
    //     if (!func) throw errors.argumentNull("func");

    //     for (let i = 0; i < this.items.length; i++)
    //         func(this.items[i]);
    // }

    // add(item: RequestProcessorType) {
    //     var isExists = this.items.filter(o => o.name == item.name).length > 0;
    //     if (isExists)
    //         throw errors.requestProcessorTypeExists(item.name);

    //     this.items.push(item);
    // }

    // addRange(items: RequestProcessorType[]) {
    //     if (items == null) throw errors.argumentNull("items");
    //     for (let i = 0; i < items.length; i++)
    //         this.add(items[i]);
    // }

    // insertBefore(item: RequestProcessorType, otherItemName: string) {
    //     let itemIndex = this.getItemIndexByName(otherItemName);
    //     if (itemIndex < 0)
    //         throw errors.requestProcessorTypeExists(otherItemName);

    //     this.items.splice(itemIndex, 0, item);
    // }

    // insertAfter(item: RequestProcessorType, otherItemName: string) {
    //     let itemIndex = this.getItemIndexByName(otherItemName);
    //     if (itemIndex < 0)
    //         throw errors.requestProcessorTypeExists(otherItemName);

    //     this.items.splice(itemIndex + 1, 0, item);
    // }

    // private getItemIndexByName(name: string) {
    //     let itemIndex = -1;
    //     for (let i = 0; i < this.items.length; i++) {
    //         if (this.items[i].name == name) {
    //             itemIndex = i;
    //             break;
    //         }
    //     }

    //     return itemIndex;
    // }
}