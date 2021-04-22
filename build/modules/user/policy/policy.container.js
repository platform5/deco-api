"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyContainer = exports.PolicyContainer = void 0;
class PolicyContainer {
    constructor() {
        this.policies = {};
        this.queryModels = {};
    }
    register(key, policy) {
        if (!this.policies[key]) {
            this.policies[key] = [];
        }
        this.policies[key].push(policy);
    }
    get(key) {
        return this.policies[key] || [];
    }
    registerQueryModel(name, model) {
        this.queryModels[name] = model;
    }
    getQueryModel(name) {
        return this.queryModels[name];
    }
}
exports.PolicyContainer = PolicyContainer;
const policyContainer = new PolicyContainer;
exports.policyContainer = policyContainer;
//# sourceMappingURL=policy.container.js.map