import { ObjectId, Model } from '../../../';

let debug = require('debug')('app:controller:policy:model');

export type CrudOperation = 'create' | 'read' | 'update' | 'delete';
export type Operations = CrudOperation;

export interface PolicyInterface {
  route?: Array<PolicyRule>;
  access?: Array<PolicyRule>;
  operation?: Array<PolicyRule>;
  input?: Array<PolicyRule>;
  output?: Array<PolicyRule>;
  autoFetch?: Array<PolicyRule>;
}

export class Policy implements PolicyInterface {

  route?: Array<PolicyRule>;
  access?: Array<PolicyRule>;
  operation?: Array<PolicyRule>;
  input?: Array<PolicyRule>;
  output?: Array<PolicyRule>;
  autoFetch?: Array<PolicyRule>;
  
  constructor(data: PolicyInterface = {}) {
    for (let key in data) {
      (this as any)[key] = (data as any)[key];
    }
  }

  public clone() {
    return new Policy(JSON.parse(JSON.stringify(this)));
  }

  public combine(...params: Array<PolicyInterface | Policy>) {
    for (let param of params) {
      this.extend(param);
    }
    return this;
  }

  public extend(data: Policy | PolicyInterface) {
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
    } else {
      const policy = new Policy(data);
      this.extend(policy);
    }
    return this;
  }
}

export interface PolicyPointerConfig {
  type?: 'default' | 'property' | 'query' | 'prepared';
  propertySource?: 'element' | 'res.locals' | 'req.query' | 'req.params';
  pointer: any;
  queryModel?: string | ObjectId | typeof Model; // string = Core Model, ObjectId = DynamicConfig
  queryType?: 'one' | 'many';
  query?: any;
}

export type PolicyPointer = PolicyPointerConfig | string | number | boolean | Array<string>;

export interface PolicyCondition {
  key: PolicyPointer;
  operation: 'include' | 'exclude' | 'exists' | '!exists' | 'equals';
  value?: PolicyPointer;
}

export interface PolicyRule {
  method?: Array<'get' | 'post' | 'put' | 'delete' | string>, // if not provided, apply to all, otherwise only apply to these methods
  //prepare?: Array<PolicyPointer>;
  conditions: PolicyCondition | PolicyCondition[];
  conditionsOperator?: 'and' | 'or'; // and is default  
  access?: boolean; // true for allow access (default)
  includeProperties?: Array<string>;
  excludeProperties?: Array<string>;
}