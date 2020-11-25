"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
class RequestProcessorCollection {
    constructor() {
        this.items = [];
    }
    foreach(func) {
        if (!func)
            throw errors_1.errors.argumentNull("func");
        for (let i = 0; i < this.items.length; i++)
            func(this.items[i]);
    }
    add(item) {
        var isExists = this.items.filter(o => o.name == item.name).length > 0;
        if (isExists)
            throw errors_1.errors.requestProcessorTypeExists(item.name);
        this.items.push(item);
    }
    insertBefore(item, otherItemName) {
        let itemIndex = this.getItemIndexByName(otherItemName);
        if (itemIndex < 0)
            throw errors_1.errors.requestProcessorTypeExists(otherItemName);
        this.items.splice(itemIndex, 0, item);
    }
    insertAfter(item, otherItemName) {
        let itemIndex = this.getItemIndexByName(otherItemName);
        if (itemIndex < 0)
            throw errors_1.errors.requestProcessorTypeExists(otherItemName);
        this.items.splice(itemIndex + 1, 0, item);
    }
    getItemIndexByName(name) {
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
exports.RequestProcessorCollection = RequestProcessorCollection;
