"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let debug = require('debug')('app:controller:policy:model');
class Policy {
    constructor(data = {}) {
        for (let key in data) {
            this[key] = data[key];
        }
    }
    clone() {
        return new Policy(JSON.parse(JSON.stringify(this)));
    }
    combine(...params) {
        for (let param of params) {
            this.extend(param);
        }
        return this;
    }
    extend(data) {
        if (data instanceof Policy) {
            if (data.route) {
                this.route = this.route ? this.route.concat(data.route) : data.route;
            }
            if (data.access) {
                this.access = this.access ? this.access.concat(data.access) : data.access;
            }
            if (data.operation) {
                this.operation = this.operation ? this.operation.concat(data.operation) : data.operation;
            }
            if (data.input) {
                this.input = this.input ? this.input.concat(data.input) : data.input;
            }
            if (data.output) {
                this.output = this.output ? this.output.concat(data.output) : data.output;
            }
            if (data.autoFetch) {
                this.autoFetch = this.autoFetch ? this.autoFetch.concat(data.autoFetch) : data.autoFetch;
            }
        }
        else {
            const policy = new Policy(data);
            this.extend(policy);
        }
        return this;
    }
}
exports.Policy = Policy;
//# sourceMappingURL=policy.model.js.map