"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const priority_1 = require("./priority");
class RequestProcessorTypeCollection {
    constructor(items) {
        this.items = [];
        if (items != null) {
            items.forEach((o) => this.add(o));
        }
    }
    add(item) {
        if (item == null)
            throw errors_1.errors.argumentNull("item");
        if (item.priority == null)
            item.priority = priority_1.processorPriorities.Default;
        let nextItemIndex = null;
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
    async foreach(func) {
        if (!func)
            throw errors_1.errors.argumentNull("func");
        for (let i = 0; i < this.items.length; i++) {
            let r = func(this.items[i]);
            if (r != null && r.then != null && r.catch != null) {
                await r;
            }
        }
    }
    item(index) {
        return this.items[index];
    }
    get length() {
        return this.items.length;
    }
    find(type) {
        let item = this.items.filter(o => o instanceof type)[0];
        return item;
    }
}
exports.RequestProcessorTypeCollection = RequestProcessorTypeCollection;
