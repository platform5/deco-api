import { Model, ObjectId, UpdateQuery, InstanceFromDocumentOptions } from '../../';
import { Request, Response, NextFunction } from "express";
import { MembersController } from './members.controller';


export abstract class Members extends Model {

  public appId: ObjectId;

  public superAdminRole: string = 'manager';

  // DO NOT DECORATE
  // Decoarting the property in the base class can corrupt the inherited classes
  // Please use the model_types property in type-decorator.ts to set the main class type properties
  public roles: {[key: string]: Array<string>} = {};

  // DO NOT DECORATE
  // Decoarting the property in the base class can corrupt the inherited classes
  // Please use the model_types property in type-decorator.ts to set the main class type properties
  public members: Array<{userId: ObjectId, roles: Array<string>}> = [];

  public actions(): Array<string> {
    return [];
  }

  public toDocument(operation: 'insert' | 'update' | 'upsert', properties: Array<string> = []): Promise<UpdateQuery> {    
    return super.toDocument(operation, properties).then((query) => {
      if (!this.members || this.members.length === 0) {
        if (!this.response.locals.user) {
          throw new Error('Access denied');
        }
        const members = [{
          userId: this.response.locals.user._id,
          roles: [this.superAdminRole]
        }];
        query.set('members', members);
      } else {
        query.set('members', this.members);
      }
      query.set('roles', this.roles);
      return query;
    });
  }

  static instanceFromDocument<T extends typeof Model>(document: any, options: InstanceFromDocumentOptions = {keepCopyOriginalValues: false}): Promise<InstanceType<T>> {
    return super.instanceFromDocument(document, options).then((instance) => {
      instance.set('members', document.members);
      instance.set('roles', document.roles);
      return instance as InstanceType<T>;
    });
  }

  public static fetchUserActionsWithElementId(this: typeof Model, addPolicyForActions?: Array<string>) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.params.elementId) {
        res.locals.userAction = [];
        return next();
      }
      new Promise(async (resolve, reject) => {
        try {
          const instance = await this.getOneWithId(req.params.elementId);
          res.locals.instance = instance;
          resolve(null);
        } catch (error) {
          reject(error)
        }
      }).catch(next).then(() => {
        MembersController.fetchUserActions('instance', addPolicyForActions)(req, res, next);
      });
    } 
  }

  
}