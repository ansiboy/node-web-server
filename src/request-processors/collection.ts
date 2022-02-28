import { errors } from "../errors";
import { RequestProcessor } from "../request-processor";
import { Callback } from "maishu-toolkit";



export class RequestProcessorTypeCollection {
    private _items: { [name: string]: RequestProcessor } = {};

    added: Callback<{ item: RequestProcessor }> = new Callback();


    add(name: string, item: RequestProcessor) {
        if (!name)
            throw errors.argumentNull("name");

        if (item == null)
            throw errors.argumentNull("item");

        if (this._items[name])
            throw errors.requestProcessorTypeExists(name);

        this._items[name] = item;

        // console.assert(item.constructor != null);
        // let existsItem = this.find(item.constructor as RequestProcessorType<any>);
        // if (existsItem != null) {
        //     return;
        // }

        // if (item.priority == null)
        //     item.priority = processorPriorities.Default;

        // let nextItemIndex: number | null = null;
        // for (let i = 0; i < this._items.length; i++) {
        //     let priority = this._items[i].priority;
        //     if (priority == null)
        //         break;

        //     if (priority > item.priority) {
        //         nextItemIndex = i;
        //         break;
        //     }
        // }

        // if (nextItemIndex != null) {
        //     this._items.splice(nextItemIndex, 0, item);
        // }
        // else {
        //     this._items.push(item);
        // }

        this.added.fire({ item });
    }

    get items() {
        return this._items;
    }

    get length() {
        return Object.getOwnPropertyNames(this._items).length;
    }

    find<T extends RequestProcessor>(name: string): T {
        return this.items[name] as T;
    }

    remove(name: string) {
        if (name == null) throw errors.argumentNull("name");
        delete this.items[name];
    }


}