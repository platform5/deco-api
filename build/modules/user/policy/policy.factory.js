"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyFactory = void 0;
const policy_model_1 = require("./policy.model");
let debug = require('debug')('app:controller:policy:factory');
class PolicyFactory {
    static authenticate() {
        return new policy_model_1.Policy({
            route: [
                {
                    conditions: {
                        key: {
                            type: 'property',
                            propertySource: 'res.locals',
                            pointer: 'user'
                        },
                        operation: 'exists'
                    }
                }
            ]
        });
    }
    static paramMustExist(param) {
        return new policy_model_1.Policy({
            route: [
                {
                    conditions: {
                        key: {
                            type: 'property',
                            propertySource: 'req.params',
                            pointer: param
                        },
                        operation: 'exists'
                    }
                }
            ]
        });
    }
    static localsMustExist(param) {
        return new policy_model_1.Policy({
            route: [
                {
                    conditions: {
                        key: {
                            type: 'property',
                            propertySource: 'res.locals',
                            pointer: param
                        },
                        operation: 'exists'
                    }
                }
            ]
        });
    }
    static keyMustEqual(key, source, pointer) {
        const policy = new policy_model_1.Policy();
        if (source === 'res.locals') {
            policy.extend(PolicyFactory.localsMustExist(pointer));
        }
        policy.extend(new policy_model_1.Policy({
            access: [{
                    conditions: {
                        key: key,
                        operation: 'equals',
                        value: {
                            type: 'property',
                            propertySource: source,
                            pointer: pointer
                        }
                    }
                }]
        }));
        return policy;
    }
    static appId() {
        return PolicyFactory.keyMustEqual('appId', 'res.locals', 'app._id');
    }
    static shopId() {
        return PolicyFactory.keyMustEqual('shopId', 'res.locals', 'shop._id');
    }
    static appKeyMustBeEqualsTo(key, value) {
        return new policy_model_1.Policy({
            route: [
                {
                    conditions: {
                        key: {
                            type: 'property',
                            propertySource: 'res.locals',
                            pointer: 'app.' + key
                        },
                        operation: 'equals',
                        value: value
                    }
                }
            ]
        });
    }
    static owner() {
        return new policy_model_1.Policy({
            access: [
                {
                    conditions: {
                        key: '_createdBy',
                        operation: 'equals',
                        value: {
                            type: 'property',
                            propertySource: 'res.locals',
                            pointer: 'user._id'
                        }
                    }
                }
            ]
        });
    }
    static userRole(roles, operation = 'include') {
        if (!Array.isArray(roles)) {
            roles = [roles];
        }
        ;
        return new policy_model_1.Policy({
            route: [
                {
                    conditions: [
                        {
                            key: {
                                type: 'property',
                                propertySource: 'res.locals',
                                pointer: 'user'
                            },
                            operation: 'exists'
                        },
                        {
                            key: {
                                type: 'property',
                                propertySource: 'res.locals',
                                pointer: 'user.roles'
                            },
                            operation: operation,
                            value: roles
                        }
                    ]
                }
            ]
        });
    }
    static memberCanDoAction(actions) {
        const policyRule = {
            conditionsOperator: 'or',
            conditions: []
        };
        for (let action of actions) {
            const condition = {
                key: {
                    type: 'property',
                    propertySource: 'res.locals',
                    pointer: 'userAction'
                },
                operation: 'include',
                value: action
            };
            policyRule.conditions.push(condition);
        }
        return new policy_model_1.Policy({
            route: [
                policyRule
            ]
        });
    }
    static userMustBeMember() {
        return PolicyFactory.keyMustEqual('members.userId', 'res.locals', 'user._id');
    }
    static projectMember(role) {
        let roles = ['manager'];
        if (role === 'member' || role === 'reader') {
            roles.push('member');
        }
        if (role === 'reader') {
            roles.push('reader');
        }
        return PolicyFactory.authenticate().extend({
            route: [
                {
                    conditions: {
                        key: {
                            type: 'query',
                            queryModel: 'Step',
                            queryType: 'one',
                            query: { members: { $elemMatch: { userId: '$res.locals.user._id', role: { $in: roles } } }, _id: '$req.params.projectId' },
                            pointer: '_id'
                        },
                        operation: 'exists'
                    }
                }
            ]
        });
    }
    static apiKey() {
        const expires = [
            { expires: null },
            { expires: { $exists: false } },
            { expires: { $gt: "$now" } }
        ];
        return new policy_model_1.Policy({
            route: [
                {
                    conditions: {
                        key: {
                            type: 'query',
                            queryModel: 'App',
                            queryType: 'one',
                            query: { 'publicKeys': { $elemMatch: { key: '$req.query.apiKey', active: true, $or: expires } } },
                            pointer: '_id'
                        },
                        operation: 'exists'
                    }
                }
            ]
        });
    }
}
exports.PolicyFactory = PolicyFactory;
//# sourceMappingURL=policy.factory.js.map