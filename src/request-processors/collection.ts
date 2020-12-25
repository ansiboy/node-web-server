import { errors } from "../errors";
import { RequestProcessor } from "../request-processor";
import { processorPriorities } from "./priority";
import { Callback } from "maishu-toolkit";

type RequestProcessorType<T extends RequestProcessor> = { new(config?: any): T };


export class RequestProcessorTypeCollection {
    private items: RequestProcessor[] = [];

    added: Callback<{ item: RequestProcessor }> = new Callback();

    constructor(items?: RequestProcessor[]) {
        if (items != null) {
            items.forEach((o) => this.add(o));
        }
    }

    add(item: RequestProcessor) {
        if (item == null)
            throw errors.argumentNull("item");

        console.assert(item.constructor != null);
        let existsItem = this.find(item.constructor as RequestProcessorType<any>);
        if (existsItem != null) {
            return;
        }

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

        this.added.fire({ item });
    }

    item(index: number) {
        return this.items[index];
    }

    get length() {
        return this.items.length;
    }

    find<T extends RequestProcessor>(type: RequestProcessorType<T>): T {
        let item = this.items.filter(o => o instanceof type || o.constructor.name == type.name)[0] as T;
        return item;
    }


}