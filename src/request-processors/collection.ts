import { errors } from "../errors";
import { RequestProcessor } from "../request-processor";

type RequestProcessorType = { new(config?: any): RequestProcessor }


export class RequestProcessorTypeCollection {
    private items: RequestProcessorType[] = [];

    map = this.items.map;

    foreach(func: (item: RequestProcessorType) => void) {
        if (!func) throw errors.argumentNull("func");

        for (let i = 0; i < this.items.length; i++)
            func(this.items[i]);
    }

    add(item: RequestProcessorType) {
        var isExists = this.items.filter(o => o.name == item.name).length > 0;
        if (isExists)
            throw errors.requestProcessorTypeExists(item.name);

        this.items.push(item);
    }

    addRange(items: RequestProcessorType[]) {
        if (items == null) throw errors.argumentNull("items");
        for (let i = 0; i < items.length; i++)
            this.add(items[i]);
    }

    insertBefore(item: RequestProcessorType, otherItemName: string) {
        let itemIndex = this.getItemIndexByName(otherItemName);
        if (itemIndex < 0)
            throw errors.requestProcessorTypeExists(otherItemName);

        this.items.splice(itemIndex, 0, item);
    }

    insertAfter(item: RequestProcessorType, otherItemName: string) {
        let itemIndex = this.getItemIndexByName(otherItemName);
        if (itemIndex < 0)
            throw errors.requestProcessorTypeExists(otherItemName);

        this.items.splice(itemIndex + 1, 0, item);
    }

    private getItemIndexByName(name: string) {
        let itemIndex = -1;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].name == name) {
                itemIndex = i;
                break;
            }
        }

        return itemIndex;
    }
}