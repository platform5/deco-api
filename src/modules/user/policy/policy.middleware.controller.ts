import { DynamicHelper, Policies } from '../../../';
import { ControllerMiddleware, Model, Query, ObjectId, ModelOperation } from '../../../';
import { Request, Response } from 'express';
import * as Models from '../../';

let debug = require('debug')('app:middleware:policy');

export class PolicyControllerMiddlware extends ControllerMiddleware {
/*
  get policy(): Policy {
    if (!this.model) return {};
    if ((this.model.prototype as any)._policy) return ((this.model.prototype as any)._policy as Policy)
    if (Object.getPrototypeOf(this.model)._policy) return (Object.getPrototypeOf(this.model)._policy as Policy)
    return {};
  }
*/
  getPolicy(req: Request, res: Response): Policies.Policy {
    if (!this.model) return {};
    if ((this.model.prototype as any)._policy) return ((this.model.prototype as any)._policy as Policies.Policy)
    if (Object.getPrototypeOf(this.model)._policy) return (Object.getPrototypeOf(this.model)._policy as Policies.Policy)
    return {};
  }

  getModelAccessPolicy(req: Request, res: Response, operation: ModelOperation): Policies.ModelAccessPolicy | null {
    let policy = this.getPolicy(req, res);
    if (!policy) return null;
    if ((policy as any)[`${operation}Policy`]) return (policy as any)[`${operation}Policy`];
    else if ((operation === 'getAll' || operation === 'getOne') && policy.readModelPolicy) return policy.readModelPolicy;
    else if ((operation === 'post' || operation === 'put' || operation === 'delete') && policy.writeModelPolicy) return policy.writeModelPolicy;
    else if (policy.globalModelPolicy) return policy.globalModelPolicy;
    return null;
  }

  getIOPolicies(req: Request, res: Response, operation: 'input' | 'output'): Array<Policies.IOPolicy> {
    let policy = this.getPolicy(req, res);
    if (!policy) return [];
    if ((policy as any)[`${operation}Policy`]) return (policy as any)[`${operation}Policy`];
    else if (policy.globalIOPolicy) return policy.globalIOPolicy;
    return [];
  }

  extendGetAllQuery(query: Query, req: Request, res: Response): Promise<void> {
    let modelAccessPolicyOrNull = this.getModelAccessPolicy(req, res, 'getAll');
    if (modelAccessPolicyOrNull === null) return Promise.resolve();
    let modelAccessPolicy: Policies.ModelAccessPolicy = modelAccessPolicyOrNull;

    this.checkPublicPolicy(modelAccessPolicy, res, null);
    this.checkIncludeRolePolicy(modelAccessPolicy, res);
    this.checkExludeRolePolicy(modelAccessPolicy, res);

    let hasPublicQuery: boolean = false;
    let grantedAccessQueries: any = {$or: []};
    
    if (typeof modelAccessPolicy.public === 'string' && !res.locals.user) {
      // require the public field to be true
      hasPublicQuery = true;
      let publicQuery: any = {};
      publicQuery[modelAccessPolicy.public] = true;
      grantedAccessQueries.$or.push(publicQuery);
      //query.addQuery(publicQuery);
    }
    
    if (modelAccessPolicy.userIdByProperty) {
      if (!res.locals.user && !hasPublicQuery) throw new Error('Access denied');
      if (res.locals.user) {
        if (typeof modelAccessPolicy.userIdByProperty === 'string') modelAccessPolicy.userIdByProperty = [modelAccessPolicy.userIdByProperty];
        if (Array.isArray(modelAccessPolicy.userIdByProperty)) {
          for (let property of modelAccessPolicy.userIdByProperty) {
            let query: any = {};
            if (typeof property !== 'string') continue;
            query[property] = {$in:[res.locals.user._id, res.locals.user._id.toString()]};
            grantedAccessQueries.$or.push(query);
          }
        }
      }
    }

    let queryByModelPromise = Promise.resolve();

    if (modelAccessPolicy.queryByModel) {
      if (!Array.isArray(modelAccessPolicy.queryByModel)) modelAccessPolicy.queryByModel = [modelAccessPolicy.queryByModel];
      let promises: Array<Promise<any>> = [];
      let orQuery: Array<any> = [];
      for (let queryByModel of modelAccessPolicy.queryByModel) {
        let query: any = {};
        // check format
        let promise = this.fetchModelIds(res, queryByModel.model, queryByModel.query).then((modelIds) => {
          query[queryByModel.compareModelWithProperty] = {$in: modelIds};
          orQuery.push(query);
        });
        promises.push(promise);
      }
      queryByModelPromise = Promise.all(promises).then((values) => {
        if (orQuery.length) {
          grantedAccessQueries.$or.push({$or: orQuery});
        }
        if (grantedAccessQueries.$or.length) {
          query.addQuery(grantedAccessQueries);
        }
      });
    } else {
      if (grantedAccessQueries.$or.length) {
        query.addQuery(grantedAccessQueries);
      }
    }

    return queryByModelPromise;
  }

  getOneElement(element: Model, req: Request, res: Response): Promise<Model> {
    return super.getOneElement(element, req, res).then((element) => {
      return this.checkModelAccessPolicy('getOne', element, req, res);
    });
  }

  postElement(element: Model, req: Request, res: Response): Promise<Model> {
    return super.postElement(element, req, res).then((element) => {
      return this.checkModelAccessPolicy('post', element, req, res);
    });
  }

  putElement(element: Model, req: Request, res: Response): Promise<Model> {
    return super.putElement(element, req, res).then((element) => {
      return this.checkModelAccessPolicy('put', element, req, res);
    });
  }

  deleteElement(element: Model, req: Request, res: Response): Promise<Model> {
    return super.deleteElement(element, req, res).then((element) => {
      return this.checkModelAccessPolicy('delete', element, req, res);
    });
  }

  checkModelAccessPolicy(operation: ModelOperation, element: Model, req: Request, res: Response): Promise<Model> {
    let modelAccessPolicyOrNull = this.getModelAccessPolicy(req, res, operation);
    if (modelAccessPolicyOrNull === null) return Promise.resolve(element);
    let modelAccessPolicy: Policies.ModelAccessPolicy = modelAccessPolicyOrNull;

    let isPublic = this.checkPublicPolicy(modelAccessPolicy, res, element);
    this.checkIncludeRolePolicy(modelAccessPolicy, res);
    this.checkExludeRolePolicy(modelAccessPolicy, res);
    
    if (!isPublic && modelAccessPolicy.userIdByProperty) {
      if (!res.locals.user) throw new Error('Access denied');
      if (typeof modelAccessPolicy.userIdByProperty === 'string') modelAccessPolicy.userIdByProperty = [modelAccessPolicy.userIdByProperty];
      if (Array.isArray(modelAccessPolicy.userIdByProperty)) {
        let foundInAtLeastOne = false;
        for (let property of modelAccessPolicy.userIdByProperty) {
          if (typeof property !== 'string') continue;
          let found = this.compareElementPropertyWithIds(element, property, [res.locals.user._id]);
          foundInAtLeastOne = foundInAtLeastOne || found;
        }
        if (!foundInAtLeastOne) throw new Error('Access denied');
      }
    }

    let queryByModelPromise = Promise.resolve();
    //let userIdByRelatedModelAndPropertyPromise = Promise.resolve();

    if (!isPublic && modelAccessPolicy.queryByModel) {
      if (!Array.isArray(modelAccessPolicy.queryByModel)) modelAccessPolicy.queryByModel = [modelAccessPolicy.queryByModel];
      let promises: Array<Promise<any>> = [];
      for (let queryByModel of modelAccessPolicy.queryByModel) {
        // check format
        let promise = this.fetchModelIds(res, queryByModel.model, queryByModel.query).then((modelIds) => {
          let found = this.compareElementPropertyWithIds(element, queryByModel.compareModelWithProperty, modelIds);
          if (!found) return 0;
          return 1
        });
        promises.push(promise);
      }
      queryByModelPromise = Promise.all(promises).then((values) => {
        let totalScore = values.reduce((a, b) => a + b, 0);
        if (totalScore < 1) throw new Error('Access denied');
      })
    }

    return queryByModelPromise.then(() => {
      return Promise.resolve(element);
    });
  }

  checkPublicPolicy(modelAccessPolicy: Policies.ModelAccessPolicy, res: Response, element: Model | null): boolean | null{
    if (modelAccessPolicy.public === true) return true;
    if (modelAccessPolicy.public === false && !res.locals.user) throw new Error('Access denied 1');
    if (modelAccessPolicy.public === false) return false;
    if (element === null) {
      // this happens when we check public policy in extendGetAllQuery
      // we don't want to refuse access in this case but extend the query to include the
      // field that we need to be true for public
      return null;
    }
    if (typeof modelAccessPolicy.public === 'string' && (element as any)[modelAccessPolicy.public]) return true;
    if (!res.locals.user) throw new Error('Access denied 2');
    return false;
  }

  checkIncludeRolePolicy(modelAccessPolicy: Policies.ModelAccessPolicy, res: Response) {
    if (modelAccessPolicy.roles && Array.isArray(modelAccessPolicy.roles) && modelAccessPolicy.roles.length) {
      if (!res.locals.user) throw new Error('Access denied');
      if (!res.locals.user.roles || !Array.isArray(res.locals.user.roles)) throw new Error('Access denied');
      let found = modelAccessPolicy.roles.some(v => res.locals.user.roles.includes(v));
      if (!found) throw new Error('Access denied');
    }
  }

  checkExludeRolePolicy(modelAccessPolicy: Policies.ModelAccessPolicy, res: Response) {
    if (modelAccessPolicy.excludeRoles && Array.isArray(modelAccessPolicy.excludeRoles) && modelAccessPolicy.excludeRoles.length) {
      if (res.locals.user && res.locals.user.roles && Array.isArray(res.locals.user.roles)) {
        let found = modelAccessPolicy.excludeRoles.some(v => res.locals.user.roles.includes(v));
        if (found) throw new Error('Access denied');
      }
    }
  }


  fetchModelIds(res: Response, modelName: string, query: any): Promise<Array<ObjectId>> {
    if (!res.locals.app) throw new Error('Missing app');
    if (!res.locals.user) throw new Error('Missing user');

    try {
      for (let k1 in query) {
        let v1 = query[k1];
        if (v1 === "$userId") {
          query[k1] = res.locals.user._id;
        } else if (typeof v1 === 'object') {
          for (let k2 in v1) {
            let v2 = v1[k2];
            if (v2 === "$userId") {
              v1[k2] = res.locals.user._id;
            }
          }
        }
      }

    } catch (e) {
      throw new Error('Invalid policy');
    }

    let elementsPromise: Promise<Array<Model>> = Promise.resolve([]);

    if ((Models as any)[modelName]) {
      elementsPromise = ((Models as any)[modelName] as typeof Model).getAll(new Query(query));
    } else {
      elementsPromise = DynamicHelper.getElementInstances(res.locals.app, modelName, new Query(query))

    }

    return elementsPromise.then((elements) => {
      return elements.map(i => i._id);
    });

  }

  compareElementPropertyWithIds(element: Model, property: string, ids: Array<ObjectId>): boolean {
    let idsString = ids.map(i => i.toString());
    if (property.indexOf('.') !== -1) {
      // todo: handle property name with dot (.) such as member.userId
      return true;
    } else {
      let value = (element as any)[property];
      if (!value) throw new Error('Access denied');
      if (Array.isArray(value)) {
        let valueStrings = value.map(i => i.toString());
        let found = value.some(v => idsString.includes(v))
        return found;
      } else if (value instanceof ObjectId) {
        return idsString.includes(value.toString());
      } else if (typeof value === 'string') {
        return idsString.includes(value);
      } else {
        return false;
      }
    }

  }

  preInput<T>(element: T, req: Request, res: Response): Promise<T> {
    let ioPolicies = this.getIOPolicies(req, res, 'input');
    if (ioPolicies.length === 0) return Promise.resolve(element);
    this.applyIOPolicies(res, element, req.body, ioPolicies);
    return Promise.resolve(element);
  }

  postOutput(element: any, req: Request, res: Response): Promise<any> {
    let ioPolicies = this.getIOPolicies(req, res, 'output');
    if (ioPolicies.length === 0) return Promise.resolve(element);
    this.applyIOPolicies(res, element, element, ioPolicies);
    return Promise.resolve(element);
  }

  postOutputList(elements: any, req: Request, res: Response): Promise<any> {
    let ioPolicies = this.getIOPolicies(req, res, 'output');
    if (ioPolicies.length === 0) return Promise.resolve(elements);
    for (let element of elements) {
      this.applyIOPolicies(res, element, element, ioPolicies);
    }
    return Promise.resolve(elements);
  }

  applyIOPolicies(res: Response, element: any, obj: any, ioPolicies: Array<Policies.IOPolicy>): void {
    for (let ioPolicy of ioPolicies) {
      if (!element && ioPolicy.ignoreOnPost === true) continue;
      if (ioPolicy.context === '*') {
        this.filterObjectWithIOPolicy(obj, ioPolicy);
        return;
      }
      if (ioPolicy.context === 'userIdInProperty') {
        if (!res.locals.user) throw new Error('Missing User');
        if (!element) throw new Error('Missing element');
        if (typeof ioPolicy.contextValue !== 'string') throw new Error('Invalid contextValue policy');
        let found = this.compareElementPropertyWithIds(element, ioPolicy.contextValue, [res.locals.user._id]);
        if (found) {
          this.filterObjectWithIOPolicy(obj, ioPolicy);
          return;
        }
      }
      if (ioPolicy.context === 'roles') {
        if (!res.locals.user) throw new Error('Missing User');
        if (ioPolicy.contextValue && Array.isArray(ioPolicy.contextValue) && ioPolicy.contextValue.length) {
          if (!res.locals.user.roles || !Array.isArray(res.locals.user.roles)) throw new Error('Mising User Roles');
          let found = ioPolicy.contextValue.some(v => res.locals.user.roles.includes(v));
          this.filterObjectWithIOPolicy(obj, ioPolicy);
          return;
        }
      }
    }
  }

  filterObjectWithIOPolicy(obj: any, ioPolicy: Policies.IOPolicy) {
    if (ioPolicy.operation !== 'exclude') ioPolicy.operation = 'include';
    let properties: Array<string>;
    if (ioPolicy.properties === '*') {
      properties = Object.keys(obj);
    } else if (ioPolicy.properties === 'extractedFrom') {
      let extractedFrom = ioPolicy.propertiesExtractedFrom || '';
      let extractedPropertiesValue = obj[extractedFrom];
      if (extractedPropertiesValue === undefined || extractedPropertiesValue === null) extractedPropertiesValue = [];
      properties = extractedPropertiesValue;
    } else {
      properties = ioPolicy.properties;
    }

    if (!Array.isArray(properties)) {
      // todo: decide what to do when this is wrong
      throw new Error('Invalid properties for IO Policy');
    }

    for (let property in obj) {
      if (ioPolicy.operation === 'include' && properties.indexOf(property) === -1) delete obj[property];
      if (ioPolicy.operation === 'exclude' && properties.indexOf(property) !== -1) delete obj[property];
    }
    
  }
  
}