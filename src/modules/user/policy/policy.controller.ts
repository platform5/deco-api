import { UserModel } from './../user.model';
import { AppModel } from './../../app/app.model';
import { AuthMiddleware } from './../auth.middleware';
import { ControllerMiddleware } from './../../../middlewares/controller';
import { NextFunction } from 'express';
import { ObjectId, Query, Model, GetAllOptions, GetOneOptions } from '../../../';
import { Request, Response } from 'express';
import resolvePath from 'object-resolve-path';
import { Policy, PolicyPointer, PolicyPointerConfig } from './policy.model';
import moment from 'moment';
import { traverse } from 'traverse-async';
import { policyContainer } from './policy.container';
let debug = require('debug')('app:controller:policy:middleware');

export class PolicyController extends ControllerMiddleware {

  private async computePointer(pointer: PolicyPointer, req: Request, res: Response): Promise<any> {
    if (typeof pointer === 'string' || typeof pointer === 'number' || typeof pointer === 'boolean' || Array.isArray(pointer)) {
      return pointer;
    }
    
    if (!pointer.type || pointer.type === 'default') {
      return pointer.pointer;
    } else if (pointer.type === 'property') {
      let source: any;
      if (pointer.propertySource === 'element') {
        source = res.locals.element;
      } else if (pointer.propertySource === 'res.locals') {
        if (pointer.pointer && pointer.pointer.substr(0, 4) === 'user' && !res.locals.user) {
          await AuthMiddleware.tryToAuthenticate(req, res);
        }
        source = res.locals;
      } else if (pointer.propertySource === 'req.query') {
        source = req.query;
      } else if (pointer.propertySource === 'req.params') {
        source = req.params;
      }
      return resolvePath(source, pointer.pointer);
    } else if (pointer.type === 'query') {
      await this.traversePointerQuery(pointer, req, res);
      let model: typeof Model;
      if (pointer.queryModel === 'App') { model = AppModel; }
      else if (pointer.queryModel === 'User') { model = UserModel; }
      else if (typeof pointer.queryModel === 'string' && policyContainer.getQueryModel(pointer.queryModel)) {
        model = policyContainer.getQueryModel(pointer.queryModel);
      } else {
        throw new Error('Query Model ' + pointer.queryModel + ' not yet implemented');
      }
      if (pointer.queryType !== 'many') {
        let element = await model.getOneWithQuery(pointer.query);
        return resolvePath(element, pointer.pointer);
      } else {
        throw new Error('Query many in pointer is not implemented yet');
      }
    }
  }

  private async traversePointerQuery(pointer: PolicyPointerConfig, req: Request, res: Response) {
    const __this = this;
    await new Promise((resolve) => {
      traverse(pointer.query, async function (node, next) {
        let val = node;
        if (typeof val !== 'string') return next();
        if (val.substr(0, 5) == '$req.') {
          val = resolvePath(req, val.substr(5));
          // try to convert to ObjectId
          if (val.length === 32 && this.key && (this.key === '_id' || this.key.substr(-2) === 'Id')) {
            try {
              val = new ObjectId(val);
            } catch (error) {
              // ignore error
            }
          }
          this.parent[this.key] = val;
        } else if (val.substr(0, 5) == '$res.') {
          if (val.substr(5, 11) === 'locals.user' && !res.locals.user) {
            try {
              await AuthMiddleware.tryToAuthenticate(req, res);
            } catch (error) {
              // ignore
            }
          }
          val = resolvePath(res, val.substr(5));
          this.parent[this.key] = val;
        } else if (val === '$now') {
          val = moment().toDate();
          this.parent[this.key] = val;
        }
        return next();
      }, () => {
        resolve(null);
      });
    });
  }

  public registerPolicyMountingPoint(key: string | string[]) {
    return PolicyController.registerPolicyMountingPoint(key);
  }

  public static registerPolicyMountingPoint(key: string | string[]) {
    return (_req: Request, res: Response, next: NextFunction) => {
      if (!res.locals.policyMounts) {
        res.locals.policyMounts = [];
      }
      if (!Array.isArray(key)) {
        key = [key];
      }
      res.locals.policyMounts.push(...key);
      next();
    }
  }

  private mountPolicies(res: Response) {
    if (!res.locals.policyMounts) return;
    if (!res.locals.policy) {
      res.locals.policy = new Policy();
    }
    const policy: Policy = res.locals.policy;
    for (let mountingPoint of res.locals.policyMounts) {
      for (let newPolicy of policyContainer.get(mountingPoint)) {
        policy.extend(newPolicy);
      }
    }
  }

  public addPolicy(newPolicy: Policy | Policy[]) {
    return PolicyController.addPolicy(newPolicy);
  }

  public static addPolicy(newPolicy: Policy | Policy[]) {
    return (_req: Request, res: Response, next: NextFunction) => {
      if (!res.locals.policy) {
        res.locals.policy = new Policy();
      }
      const policy: Policy = res.locals.policy;
      if (!Array.isArray(newPolicy)) { newPolicy = [newPolicy]};
      for (let newPolicyItem of newPolicy) {
        policy.extend(newPolicyItem);
      }
      next();
    }
  }

  public checkRoutePolicy() {
    return async(req: Request, res: Response, next: NextFunction) => {
      this.mountPolicies(res);
      if (!res.locals.policy?.route) {
        return next();
      }
      try {

        const policy: Policy = (res.locals.policy as Policy).clone();
        for (let rule of policy.route || []) {
          if (rule.method?.length) {
            if (rule.method.indexOf(req.method.toLowerCase()) === -1) {
              // ignore rules that target specific methods
              continue;
            }
          }
          // determine if policy should apply by checking its conditions
          let ruleIsRelevant = false;
          rule.conditions = Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
          rule.conditionsOperator = rule.conditionsOperator || 'and';
          for (let condition of rule.conditions) {
            let key = await this.computePointer(condition.key, req, res);
            let value = condition.value ? await this.computePointer(condition.value, req, res) : undefined;
            let conditionMatch: boolean = true;
            if (condition.operation === 'equals') {
              conditionMatch = key === value;
            } else if (condition.operation === 'exists') {
              conditionMatch = key !== undefined;
            } else if (condition.operation === '!exists') {
              conditionMatch = key === undefined;
            } else if (condition.operation === 'include') {
              if (!Array.isArray(key)) {
                key = [key];
              }
              if (!Array.isArray(value)) {
                value = [value];
              }
              conditionMatch = value.filter((v: any) => key.includes(v)).length !== 0;
            } else if (condition.operation === 'exclude') {
              if (!Array.isArray(key)) {
                key = [key];
              }
              if (!Array.isArray(value)) {
                value = [value];
              }
              conditionMatch = value.filter((v: any) => key.includes(v)).length === 0;
            }
            if (conditionMatch && rule.conditionsOperator === 'or') {
              ruleIsRelevant = true;
              break;
            } else if (!conditionMatch && rule.conditionsOperator === 'and') {
              ruleIsRelevant = false;
              break;
            }
            if (conditionMatch) {
              ruleIsRelevant = true;
            }
          }
          if (ruleIsRelevant && rule.access === false) {
            throw new Error('Access denied');
          } else if (!ruleIsRelevant && (rule.access === undefined || rule.access === true)) {
            throw new Error('Access denied');
          }
        }
        next();
      } catch (error) {
        next(error);
      }
    }
  }

  public extendGetAllQuery(query: Query, req: Request, res: Response, options: GetAllOptions): Promise<void> {
    return this.checkAccessPolicy(query, req, res, options);
  }

  public extendGetOneQuery(query: Query, req: Request, res: Response, options: GetOneOptions): Promise<void> {
    return this.checkAccessPolicy(query, req, res, options);
  }


  public async checkAccessPolicy(query: Query, req: Request, res: Response, options: GetAllOptions | GetOneOptions): Promise<void> {
    if (!res.locals.policy?.access) {
      return;
    }
    const policy: Policy = (res.locals.policy as Policy).clone();
    for (let rule of policy.access || []) {
      if (rule.method?.length) {
        if (rule.method.indexOf(req.method.toLowerCase()) === -1) {
          // ignore rules that target specific methods
          continue;
        }
      }
      // determine if policy should apply by checking its conditions
      let queries: Array<Query> = [];
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
        let value = condition.value ? await this.computePointer(condition.value, req, res) : undefined;
        let ruleQuery = new Query();
        if (condition.operation === 'equals' && key !== value) {
          ruleQuery.addQueryForKey(key, value);
        } else if (condition.operation === 'exists' && key === undefined) {
          ruleQuery.addQueryForKey(key, {$exists: true});
        } else if (condition.operation === '!exists' && key !== undefined) {
          ruleQuery.addQueryForKey(key, {$exists: false})
        } else if (condition.operation === 'include') {
          ruleQuery.addQueryForKey(key, {$in: value});
        } else if (condition.operation === 'exclude') {
          ruleQuery.addQueryForKey(key, {$nin: value});
        }
        if (ruleQuery) {
          queries.push(ruleQuery);
        }
      }
      if (rule.conditionsOperator === 'or') {
        query.addQuery({$or: queries.map(q => q.onlyQuery())});
      } else {
        query.addQuery({$and: queries.map(q => q.onlyQuery())});
      }
    }
  }

  // public async extendGetAllQuery(query: Query, req: Request, res: Response): Promise<void> {
  //   const policy: Policy = res.locals.policy;
  //   if (!policy?.access) {
  //     return;
  //   }

  //   for (let rule of policy.access) {
  //     let value = await this.computeValue(rule, req, res);
  //     let key = rule.key; //  this.computeSpecialProperty(rule.key, req, res); // I don't think computing here makes any sense ?
      
  //     if (rule.type === 'property') {
  //       let query: any = {};
  //       if (rule.operation === 'equals') {
  //         query[key] = value;
  //       } else if (rule.operation === 'exists' || rule.operation === '!exists') {
  //         query[key] = {$exists: rule.operation === 'exists'};
  //       } else if (rule.operation === 'include') {
  //         query[key] = {$in: value}
  //       } else if (rule.operation === 'exclude') {
  //         query[key] = {$nin: value}
  //       }
  //       query.addQuery()
  //     }
  //   }

  //   return Promise.resolve();
  // }


}





