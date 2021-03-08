import { ControllerMiddleware } from './../../middlewares/controller';
import { Model, Query, ObjectId } from '../../';
import { Request, Response } from 'express';
let debug = require('debug')('app:middleware:byapp');

export interface ModelByApp extends Model {
  appId?: ObjectId;
}

export interface ModelWithUsers extends Model {
  users?: Array<ObjectId>;
}

export interface UserRoles {
  _id: ObjectId;
  roles: Array<string>;
}

export interface ModelWithUsersRoles extends Model {
  users?: Array<UserRoles>;
}

export class AccessControllerMiddlware extends ControllerMiddleware {

  public readByApp: boolean = true;
  public writeByApp: boolean = true;

  public readByCreator: boolean = false;
  public writeByCreator: boolean = false;

  public readByUsersArray: boolean = false;
  public writeByUsersArray: boolean = false;

  public readByUsersRoles: boolean = false;
  public writeByUsersRoles: boolean = false;

  public readUsersRoles: Array<string> = [];
  public writeUsersRoles: Array<string> = [];

  public enableRelatedToAppId: boolean = false;

  /*
  restrictByApp: boolean = true;
  restrictByCreator: boolean = false;
  restrictByUsersArray: boolean = false;
  restrictByUsersRoles: boolean = false;
  userRoles: Array<string> = [];
  */

  extendGetAllQuery(query: Query, req: Request, res: Response): Promise<void> {
    if (this.readByApp) {
      if (!res.locals.app && !res.locals.dynamicModelApp) throw new Error('Missing app');


      let appId = (res.locals.dynamicModelApp) ? res.locals.dynamicModelApp._id : res.locals.app._id;
      let readQuery: any = {$or: [{appId: appId}]};
      if (this.enableRelatedToAppId) {
        readQuery.$or.push({relatedToAppId: appId});
      }
      query.addQuery(readQuery);
    }
    if (this.readByCreator) {
      if (!res.locals.user) throw new Error('Missing user');
      query.addQuery({_createdBy: res.locals.user._id});
    }
    if (this.readByUsersArray) {
      if (!res.locals.user) throw new Error('Missing user');
      query.addQuery({users: res.locals.user._id});
    }
    if (this.readByUsersRoles) {
      if (!res.locals.user) throw new Error('Missing user');

      let readQuery = {
        users: {$elemMatch: {
          _id: res.locals.user._id,
          roles: {$elemMatch: {
            $in: this.readUsersRoles
          }}
        }}
      };

      query.addQuery(readQuery);
    }
    return Promise.resolve();
  }

  getOneElement(element: Model, req: Request, res: Response): Promise<Model> {
    if (this.readByApp) this.checkAppId(element, req, res);
    if (this.readByCreator) this.checkCreatoriId(element, req, res);
    if (this.readByUsersArray) this.checkUsersArray(element, req, res);
    if (this.readByUsersRoles) this.checkUsersRoles(element, req, res, this.readUsersRoles);
    return Promise.resolve(element);
  }

  postElement(element: Model, req: Request, res: Response): Promise<Model> {
    if (this.writeByApp) {
      if (!res.locals.app && !res.locals.dynamicModelApp) throw new Error('Missing app');
      (element as ModelByApp).appId = (res.locals.dynamicModelApp) ? res.locals.dynamicModelApp._id : res.locals.app._id;
    }
    if (this.writeByCreator) {
      if (!res.locals.user) throw new Error('Missing user');
      element._createdBy = res.locals.user._id;
    }
    if (this.writeByUsersArray) {
      if (!res.locals.user) throw new Error('Missing user');
      let e: ModelWithUsers = (element as ModelByApp);
      if (!e.users || !Array.isArray(e.users) || e.users.length === 0) e.users = [res.locals.user._id];
    }
    if (this.writeByUsersRoles) {
      if (!res.locals.user) throw new Error('Missing user');
      let e: ModelWithUsersRoles = (element as ModelByApp);
      if (!e.users || !Array.isArray(e.users) || e.users.length === 0) e.users = [{
        _id: res.locals.user._id,
        roles: this.writeUsersRoles
      }];
    }
    return Promise.resolve(element);
  }

  putElement(element: Model, req: Request, res: Response): Promise<Model> {
    if (this.writeByApp) this.checkAppId(element, req, res);
    if (this.writeByCreator) this.checkCreatoriId(element, req, res);
    if (this.writeByUsersArray) this.checkUsersArray(element, req, res);
    if (this.readByUsersRoles) this.checkUsersRoles(element, req, res, this.writeUsersRoles);
    return Promise.resolve(element);
  }

  deleteElement(element: Model, req: Request, res: Response): Promise<Model> {
    if (this.writeByApp) this.checkAppId(element, req, res);
    if (this.writeByCreator) this.checkCreatoriId(element, req, res);
    if (this.writeByUsersArray) this.checkUsersArray(element, req, res);
    if (this.readByUsersRoles) this.checkUsersRoles(element, req, res, this.writeUsersRoles);
    return Promise.resolve(element);
  }

  checkAppId(element: Model, req: Request, res: Response) {
    if (!res.locals.app && !res.locals.dynamicModelApp) throw new Error('Missing app');
    let e: ModelByApp = (element as ModelByApp);
    if (!e.appId) throw new Error('Access denied');
    if (e.appId.toString() !== ((res.locals.dynamicModelApp) ? res.locals.dynamicModelApp._id : res.locals.app._id).toString()) throw new Error('Access denied');
  }

  checkCreatoriId(element: Model, req: Request, res: Response) {
    if (!res.locals.user) throw new Error('Missing user');
    if (!element._createdBy) throw new Error('Access denied');
    if (element._createdBy.toString() !== res.locals.user._id.toString()) throw new Error('Access denied');
  }

  checkUsersArray(element: Model, req: Request, res: Response) {
    if (!res.locals.user) throw new Error('Missing user');
    let e: ModelWithUsers = (element as ModelByApp);
    if (!e.users) throw new Error('Access denied');

    for (let index in e.users || []) {
      let id = e.users[index];
      if (id.toString() === res.locals.user._id.toString()) return true;
    }   
    throw new Error('Access denied');
  }

  checkUsersRoles(element: Model, req: Request, res: Response, roles: Array<string>) {
    if (!res.locals.user) throw new Error('Missing user');
    let e: ModelWithUsersRoles = (element as ModelByApp);
    if (!e.users) throw new Error('Access denied');

    for (let index in e.users || []) {
      let user = e.users[index];
      if (user._id.toString() === res.locals.user._id.toString()) {
        for (let roleIndex in roles) {
          let role = roles[roleIndex];
          if (user.roles.indexOf(role) !== -1) return true;
        }
      }
    }   
    throw new Error('Access denied');
  }
}