import { ObjectId, Model } from '../../../';
export declare type CrudOperation = 'create' | 'read' | 'update' | 'delete';
export declare type Operations = CrudOperation;
export interface PolicyInterface {
    route?: Array<PolicyRule>;
    access?: Array<PolicyRule>;
    operation?: Array<PolicyRule>;
    input?: Array<PolicyRule>;
    output?: Array<PolicyRule>;
    autoFetch?: Array<PolicyRule>;
}
export declare class Policy implements PolicyInterface {
    route?: Array<PolicyRule>;
    access?: Array<PolicyRule>;
    operation?: Array<PolicyRule>;
    input?: Array<PolicyRule>;
    output?: Array<PolicyRule>;
    autoFetch?: Array<PolicyRule>;
    constructor(data?: PolicyInterface);
    clone(): Policy;
    combine(...params: Array<PolicyInterface | Policy>): this;
    extend(data: Policy | PolicyInterface): this;
}
export interface PolicyPointerConfig {
    type?: 'default' | 'property' | 'query' | 'prepared';
    propertySource?: 'element' | 'res.locals' | 'req.query' | 'req.params' | 'req.body';
    pointer: any;
    queryModel?: string | ObjectId | typeof Model;
    queryType?: 'one' | 'many';
    query?: any;
}
export declare type PolicyPointer = PolicyPointerConfig | string | number | boolean | Array<string>;
export interface PolicyCondition {
    key: PolicyPointer;
    operation: 'include' | 'exclude' | 'exists' | '!exists' | 'equals';
    value?: PolicyPointer;
}
export interface PolicyRule {
    method?: Array<'get' | 'post' | 'put' | 'delete' | string>;
    conditions: PolicyCondition | PolicyCondition[];
    conditionsOperator?: 'and' | 'or';
    access?: boolean;
    includeProperties?: Array<string>;
    excludeProperties?: Array<string>;
}
//# sourceMappingURL=policy.model.d.ts.map