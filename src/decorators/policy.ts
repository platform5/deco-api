import { ModelOperation } from '../';

export class QueryByModel {
  model: string;
  query: any;
  compareModelWithProperty: string;
}

export interface ModelAccessPolicy {
  public?: boolean | string;
  roles?: Array<string>;
  excludeRoles?: Array<string>;
  userIdByProperty?: string | Array<string>;
  queryByModel?: QueryByModel | Array<QueryByModel>;
}

export interface IOPolicy {
  context: 'userIdInProperty' | 'roles' | '*',
  contextValue?: string | Array<string>;
  properties: '*' | 'extractedFrom' | Array<string>;
  propertiesExtractedFrom?: string;
  operation: 'include' | 'exclude';
  ignoreOnPost?: boolean;
}

export interface Policy {
  globalModelPolicy?: ModelAccessPolicy;
  readModelPolicy?: ModelAccessPolicy;
  writeModelPolicy?: ModelAccessPolicy;
  getAllPolicy?: ModelAccessPolicy;
  getOnePolicy?: ModelAccessPolicy;
  postPolicy?: ModelAccessPolicy;
  putPolicy?: ModelAccessPolicy;
  deletePolicy?: ModelAccessPolicy;

  globalIOPolicy?: Array<IOPolicy>;
  inputPolicy?: Array<IOPolicy>;
  outputPolicy?: Array<IOPolicy>;
}

export const modelPolicy = (operation: ModelOperation | 'globalModel', policy: ModelAccessPolicy = {}) => {
  return function (target: any): void {
    if (!target.prototype._policy) target.prototype._policy = {};
    let policyKey = `${operation}Policy`;
    target.prototype._policy[policyKey] = policy;
  }
}

export const propertyPolicy = (operation: 'input' | 'output' | 'globalIO', policies: Array<IOPolicy>) => {
  return function (target: any): void {
    if (!target.prototype._policy) target.prototype._policy = {};
    let policyKey = `${operation}Policy`;
    target.prototype._policy[policyKey] = policies;
  }
}