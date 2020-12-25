"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const priority_1 = require("./priority");
const maishu_toolkit_1 = require("maishu-toolkit");
class RequestProcessorTypeCollection {
    constructor(items) {
        this.items = [];
        this.added = new maishu_toolkit_1.Callback();
        if (items != null) {
            items.forEach((o) => this.add(o));
        }
    }
    add(item) {
        if (item == null)
            throw errors_1.errors.argumentNull("item");
        console.assert(item.constructor != null);
        let existsItem = this.find(item.constructor);
        if (existsItem != null) {
            return;
        }
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
        this.added.fire({ item });
    }
    item(index) {
        return this.items[index];
    }
    get length() {
        return this.items.length;
    }
    find(type) {
        let item = this.items.filter(o => o instanceof type || o.constructor.name == type.name)[0];
        return item;
    }
}
exports.RequestProcessorTypeCollection = RequestProcessorTypeCollection;
