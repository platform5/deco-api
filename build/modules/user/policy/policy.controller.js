"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyController = void 0;
const user_model_1 = require("./../user.model");
const app_model_1 = require("./../../app/app.model");
const auth_middleware_1 = require("./../auth.middleware");
const controller_1 = require("./../../../middlewares/controller");
const __1 = require("../../../");
const object_resolve_path_1 = __importDefault(require("object-resolve-path"));
const policy_model_1 = require("./policy.model");
const moment_1 = __importDefault(require("moment"));
const traverse_async_1 = require("traverse-async");
const policy_container_1 = require("./policy.container");
let debug = require('debug')('app:controller:policy:middleware');
class PolicyController extends controller_1.ControllerMiddleware {
    computePointer(pointer, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof pointer === 'string' || typeof pointer === 'number' || typeof pointer === 'boolean' || Array.isArray(pointer)) {
                return pointer;
            }
            if (!pointer.type || pointer.type === 'default') {
                return pointer.pointer;
            }
            else if (pointer.type === 'property') {
                let source;
                if (pointer.propertySource === 'element') {
                    source = res.locals.element;
                }
                else if (pointer.propertySource === 'res.locals') {
                    if (pointer.pointer && pointer.pointer.substr(0, 4) === 'user' && !res.locals.user) {
                        yield auth_middleware_1.AuthMiddleware.tryToAuthenticate(req, res);
                    }
                    source = res.locals;
                }
                else if (pointer.propertySource === 'req.query') {
                    source = req.query;
                }
                else if (pointer.propertySource === 'req.params') {
                    source = req.params;
                }
                return object_resolve_path_1.default(source, pointer.pointer);
            }
            else if (pointer.type === 'query') {
                yield this.traversePointerQuery(pointer, req, res);
                let model;
                if (pointer.queryModel === 'App') {
                    model = app_model_1.AppModel;
                }
                else if (pointer.queryModel === 'User') {
                    model = user_model_1.UserModel;
                }
                else if (typeof pointer.queryModel === 'string' && policy_container_1.policyContainer.getQueryModel(pointer.queryModel)) {
                    model = policy_container_1.policyContainer.getQueryModel(pointer.queryModel);
                }
                else {
                    throw new Error('Query Model ' + pointer.queryModel + ' not yet implemented');
                }
                if (pointer.queryType !== 'many') {
                    let element = yield model.getOneWithQuery(pointer.query);
                    return object_resolve_path_1.default(element, pointer.pointer);
                }
                else {
                    throw new Error('Query many in pointer is not implemented yet');
                }
            }
        });
    }
    traversePointerQuery(pointer, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const __this = this;
            yield new Promise((resolve) => {
                traverse_async_1.traverse(pointer.query, function (node, next) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let val = node;
                        if (typeof val !== 'string')
                            return next();
                        if (val.substr(0, 5) == '$req.') {
                            val = object_resolve_path_1.default(req, val.substr(5));
                            // try to convert to ObjectId
                            if (val.length === 32 && this.key && (this.key === '_id' || this.key.substr(-2) === 'Id')) {
                                try {
                                    val = new __1.ObjectId(val);
                                }
                                catch (error) {
                                    // ignore error
                                }
                            }
                            this.parent[this.key] = val;
                        }
                        else if (val.substr(0, 5) == '$res.') {
                            if (val.substr(5, 11) === 'locals.user' && !res.locals.user) {
                                try {
                                    yield auth_middleware_1.AuthMiddleware.tryToAuthenticate(req, res);
                                }
                                catch (error) {
                                    // ignore
                                }
                            }
                            val = object_resolve_path_1.default(res, val.substr(5));
                            this.parent[this.key] = val;
                        }
                        else if (val === '$now') {
                            val = moment_1.default().toDate();
                            this.parent[this.key] = val;
                        }
                        return next();
                    });
                }, () => {
                    resolve(null);
                });
            });
        });
    }
    registerPolicyMountingPoint(key) {
        return PolicyController.registerPolicyMountingPoint(key);
    }
    static registerPolicyMountingPoint(key) {
        return (_req, res, next) => {
            if (!res.locals.policyMounts) {
                res.locals.policyMounts = [];
            }
            if (!Array.isArray(key)) {
                key = [key];
            }
            res.locals.policyMounts.push(...key);
            next();
        };
    }
    mountPolicies(res) {
        if (!res.locals.policyMounts)
            return;
        if (!res.locals.policy) {
            res.locals.policy = new policy_model_1.Policy();
        }
        const policy = res.locals.policy;
        for (let mountingPoint of res.locals.policyMounts) {
            for (let newPolicy of policy_container_1.policyContainer.get(mountingPoint)) {
                policy.extend(newPolicy);
            }
        }
    }
    addPolicy(newPolicy) {
        return PolicyController.addPolicy(newPolicy);
    }
    static addPolicy(newPolicy) {
        return (_req, res, next) => {
            if (!res.locals.policy) {
                res.locals.policy = new policy_model_1.Policy();
            }
            const policy = res.locals.policy;
            if (!Array.isArray(newPolicy)) {
                newPolicy = [newPolicy];
            }
            ;
            for (let newPolicyItem of newPolicy) {
                policy.extend(newPolicyItem);
            }
            next();
        };
    }
    checkRoutePolicy() {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            this.mountPolicies(res);
            if (!((_a = res.locals.policy) === null || _a === void 0 ? void 0 : _a.route)) {
                return next();
            }
            try {
                const policy = res.locals.policy.clone();
                for (let rule of policy.route || []) {
                    if ((_b = rule.method) === null || _b === void 0 ? void 0 : _b.length) {
                        if (rule.method.indexOf(req.method.toLowerCase()) === -1) {
                            // ignore rules that target specific methods
                            continue;
                        }
                    }
                    // determine if policy should apply by checking its conditions
                    let ruleIsRelevant = false;
                    rule.conditions = Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
                    rule.conditionsOperator = rule.conditionsOperator || 'and';
                    for (let condition of rule.conditions) {
                        let key = yield this.computePointer(condition.key, req, res);
                        let value = condition.value ? yield this.computePointer(condition.value, req, res) : undefined;
                        let conditionMatch = true;
                        if (condition.operation === 'equals') {
                            conditionMatch = key === value;
                        }
                        else if (condition.operation === 'exists') {
                            conditionMatch = key !== undefined;
                        }
                        else if (condition.operation === '!exists') {
                            conditionMatch = key === undefined;
                        }
                        else if (condition.operation === 'include') {
                            if (!Array.isArray(key)) {
                                key = [key];
                            }
                            if (!Array.isArray(value)) {
                                value = [value];
                            }
                            conditionMatch = value.filter((v) => key.includes(v)).length !== 0;
                        }
                        else if (condition.operation === 'exclude') {
                            if (!Array.isArray(key)) {
                                key = [key];
                            }
                            if (!Array.isArray(value)) {
                                value = [value];
                            }
                            conditionMatch = value.filter((v) => key.includes(v)).length === 0;
                        }
                        if (conditionMatch && rule.conditionsOperator === 'or') {
                            ruleIsRelevant = true;
                            break;
                        }
                        else if (!conditionMatch && rule.conditionsOperator === 'and') {
                            ruleIsRelevant = false;
                            break;
                        }
                        if (conditionMatch) {
                            ruleIsRelevant = true;
                        }
                    }
                    if (ruleIsRelevant && rule.access === false) {
                        throw new Error('Access denied');
                    }
                    else if (!ruleIsRelevant && (rule.access === undefined || rule.access === true)) {
                        throw new Error('Access denied');
                    }
                }
                next();
            }
            catch (error) {
                next(error);
            }
        });
    }
    extendGetAllQuery(query, req, res, options) {
        return this.checkAccessPolicy(query, req, res, options);
    }
    extendGetOneQuery(query, req, res, options) {
        return this.checkAccessPolicy(query, req, res, options);
    }
    checkAccessPolicy(query, req, res, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_a = res.locals.policy) === null || _a === void 0 ? void 0 : _a.access)) {
                return;
            }
            const policy = res.locals.policy.clone();
            for (let rule of policy.access || []) {
                if ((_b = rule.method) === null || _b === void 0 ? void 0 : _b.length) {
                    if (rule.method.indexOf(req.method.toLowerCase()) === -1) {
                        // ignore rules that target specific methods
                        continue;
                    }
                }
                // determine if policy should apply by checking its conditions
                let queries = [];
                rule.conditions = Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
                for (let condition of rule.conditions) {
                    if (typeof condition.key !== 'string') {
                        throw new Error('Policy Rule Key must be string for access policies');
                    }
                    let key = condition.key;
                    if (condition.value && typeof condition.value !== 'string' && typeof condition.value !== 'number' && typeof condition.value !== 'boolean' && !Array.isArray(condition.value)) {
                        if (condition.value.propertySource === 'element') {
                            throw new Error('Policy Rule value cannot be of `element` source for access policies, consider using a route policy for this');
                        }
                    }
                    let value = condition.value ? yield this.computePointer(condition.value, req, res) : undefined;
                    let ruleQuery = new __1.Query();
                    if (condition.operation === 'equals' && key !== value) {
                        ruleQuery.addQueryForKey(key, value);
                    }
                    else if (condition.operation === 'exists' && key === undefined) {
                        ruleQuery.addQueryForKey(key, { $exists: true });
                    }
                    else if (condition.operation === '!exists' && key !== undefined) {
                        ruleQuery.addQueryForKey(key, { $exists: false });
                    }
                    else if (condition.operation === 'include') {
                        ruleQuery.addQueryForKey(key, { $in: Array.isArray(value) ? value : [value] });
                    }
                    else if (condition.operation === 'exclude') {
                        ruleQuery.addQueryForKey(key, { $nin: Array.isArray(value) ? value : [value] });
                    }
                    if (ruleQuery) {
                        queries.push(ruleQuery);
                    }
                }
                if (rule.conditionsOperator === 'or') {
                    query.addQuery({ $or: queries.map(q => q.onlyQuery()) });
                }
                else {
                    query.addQuery({ $and: queries.map(q => q.onlyQuery()) });
                }
            }
        });
    }
}
exports.PolicyController = PolicyController;
//# sourceMappingURL=policy.controller.js.map