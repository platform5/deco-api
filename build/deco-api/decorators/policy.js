"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyPolicy = exports.modelPolicy = exports.QueryByModel = void 0;
class QueryByModel {
}
exports.QueryByModel = QueryByModel;
exports.modelPolicy = (operation, policy = {}) => {
    return function (target) {
        if (!target.prototype._policy)
            target.prototype._policy = {};
        let policyKey = `${operation}Policy`;
        target.prototype._policy[policyKey] = policy;
    };
};
exports.propertyPolicy = (operation, policies) => {
    return function (target) {
        if (!target.prototype._policy)
            target.prototype._policy = {};
        let policyKey = `${operation}Policy`;
        target.prototype._policy[policyKey] = policies;
    };
};
//# sourceMappingURL=policy.js.map