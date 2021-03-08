import { AuthMiddleware } from './../user/auth.middleware';
import { UserModel } from './../user/user.model';
import { ObjectId, PolicyFactory, Policy } from '../../';
import { Request, Response, NextFunction } from "express";
import { Members } from './members.abstract';

export class MembersController {
  private static async validateUserIdAndRoles(req: Request, instance: Members, validateRoles: boolean = true): Promise<UserModel> {
    let userId: ObjectId;
    if (!req.params.userId) {
      throw new Error('Missing userId');
    }
    try {
      userId = new ObjectId(req.params.userId);
    } catch (error) {
      throw new Error('Invalid userId');
    }
    if (validateRoles) {
      if (!req.body.roles) {
        throw new Error('Missing roles');
      }
      if (!Array.isArray(req.body.roles)) {
        throw new Error('Invalid roles');
      }
      req.body.roles.map((i: any) => {
        if (typeof i !== 'string') throw new Error('Invalid roles');
        if (i !== instance.superAdminRole && !instance.roles[i]) throw new Error('Invalid roles');
      });
    }
    const user = await UserModel.getOneWithQuery({appId: instance.appId, _id: userId});
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  private static getInstance(res: Response, localsProperty: string): Members | null {
    if (!res.locals[localsProperty]) {
      return null;
    }
    const rightInstance = res.locals[localsProperty] instanceof Members;
    if (!rightInstance) {
      res.locals.userAction = [];
      return null;
    }
    return res.locals[localsProperty] as Members;
  }

  
  // exemple:  GET /shop/admin/:shopId/members
  public static getMembersController(localsProperty: string, send: boolean = true) {
    return (req: Request, res: Response, next: NextFunction) => {
      const instance = MembersController.getInstance(res, localsProperty);
      if (instance === null) {
        throw new Error('Invalid request');
      }

      res.send({
        members: instance.members,
        roles: instance.roles,
        superAdminRole: instance.superAdminRole,
        actions: instance.actions()
      });
    }
  }

  // exemple:  POST /shop/admin/:shopId/members/:userId (with req.body.roles as Array<string>)
  public static addMemberController(localsProperty: string, send: boolean = true) {
    return (req: Request, res: Response, next: NextFunction) => {
      const instance = MembersController.getInstance(res, localsProperty);
      if (instance === null) {
        throw new Error('Invalid request');
      }
      new Promise(async (resolve, reject) => {
        try {
          const user = await MembersController.validateUserIdAndRoles(req, instance);
          for (let member of instance.members) {
            if (member.userId.toHexString() === req.params.userId) {
              throw new Error('This user is already a member, please use a PUT request')
            }
          }
          instance.members.push({
            userId: user._id,
            roles: req.body.roles
          });
          await instance.update(['members']);
          resolve(null);
        } catch (error) {
          reject(error);
        }
      }).then(() => {
        if (send) {
          res.send(instance.members);
        } else {
          res.locals.element = instance;
          next();
        }
      }).catch(next);
    }
  }

  // exemple:  PUT /shop/admin/:shopId/members/:userId (with req.body.roles as Array<string>)
  public static editMemberController(localsProperty: string, send: boolean = true) {
    return (req: Request, res: Response, next: NextFunction) => {
      const instance = MembersController.getInstance(res, localsProperty);
      if (instance === null) {
        throw new Error('Invalid request');
      }
      new Promise(async (resolve, reject) => {
        try {
          await MembersController.validateUserIdAndRoles(req, instance);
          let index = -1;
          for (let key in instance.members) {
            const member = instance.members[key];
            if (member.userId.toHexString() === req.params.userId) {
              index = parseInt(key, 10);
              break;
            }
          }
          if (index === -1) {
            throw new Error('This user is not yet a member, please use a POST request');
          }
          instance.members[index].roles = req.body.roles;
          let atLeaseOneSuperAdminLeft = false;
          for (let member of instance.members) {
            if (member.roles.indexOf(instance.superAdminRole) !== -1) {
              atLeaseOneSuperAdminLeft = true;
              break;
            }
          }
          if (!atLeaseOneSuperAdminLeft) {
            throw new Error('Operation not permitted: you must always keep at least one ' + instance.superAdminRole + ' role');
          }
          await instance.update(['members']);
          resolve(null);
        } catch (error) {
          reject(error);
        }
      }).then(() => {
        if (send) {
          res.send(instance.members);
        } else {
          res.locals.element = instance;
          next();
        }
      }).catch(next);
    }
  }

  // exemple:  DELETE /shop/admin/:shopId/members/:userId
  public static removeMemberController(localsProperty: string, send: boolean = true) {
    return (req: Request, res: Response, next: NextFunction) => {
      const instance = MembersController.getInstance(res, localsProperty);
      if (instance === null) {
        throw new Error('Invalid request');
      }
      new Promise(async (resolve, reject) => {
        try {
          await MembersController.validateUserIdAndRoles(req, instance, false);
          let index = -1;
          for (let key in instance.members) {
            const member = instance.members[key];
            if (member.userId.toHexString() === req.params.userId) {
              index = parseInt(key, 10);
              break;
            }
          }
          if (index !== -1) {
            instance.members.splice(index, 1);
            let atLeaseOneSuperAdminLeft = false;
            for (let member of instance.members) {
              if (member.roles.indexOf(instance.superAdminRole) !== -1) {
                atLeaseOneSuperAdminLeft = true;
                break;
              }
            }
            if (!atLeaseOneSuperAdminLeft) {
              throw new Error('Operation not permitted: you must always keep at least one ' + instance.superAdminRole + ' role');
            }
          }
          await instance.update(['members']);
          resolve(null);
        } catch (error) {
          reject(error);
        }
      }).then(() => {
        if (send) {
          res.send(instance.members);
        } else {
          res.locals.element = instance;
          next();
        }
      }).catch(next);
    }
  }

  private static validateRoles(req: Request, instance: Members) {
    if (!req.params.role) {
      throw new Error('Missing role');
    }
    if (req.params.role === instance.superAdminRole) {
      throw new Error('Operation not permitted, role ' + req.params.role + ' is protected');
    }
    if (!req.body.actions) {
      throw new Error('Missing actions');
    }
    if (!Array.isArray(req.body.actions)) {
      throw new Error('Invalid actions');
    }
    req.body.actions.map((i: any) => {
      if (typeof i !== 'string') throw new Error('Invalid actions');
      if (instance.actions().indexOf(i) === -1) throw new Error('Invalid actions');
    });
  }

  // exemple:  POST /shop/admin/:shopId/members/:userId (with req.body.roles as Array<string>)
  public static addRoleController(localsProperty: string, send: boolean = true) {
    return (req: Request, res: Response, next: NextFunction) => {
      const instance = MembersController.getInstance(res, localsProperty);
      if (instance === null) {
        throw new Error('Invalid request');
      }
      new Promise(async (resolve, reject) => {
        try {
          MembersController.validateRoles(req, instance);
          if (instance.roles[req.params.role]) {
            throw new Error('This role already exists, please use a PUT request')
          }
          instance.roles[req.params.role] = req.body.actions;
          await instance.update(['roles']);
          resolve(null);
        } catch (error) {
          return reject(error);
        }
      }).then(() => {
        if (send) {
          res.send(instance.roles);
        } else {
          res.locals.element = instance;
          next();
        }
      }).catch(next);
    }
  }

  // exemple:  PUT /shop/admin/:shopId/members/:userId (with req.body.roles as Array<string>)
  public static editRoleController(localsProperty: string, send: boolean = true) {
    return (req: Request, res: Response, next: NextFunction) => {
      const instance = MembersController.getInstance(res, localsProperty);
      if (instance === null) {
        throw new Error('Invalid request');
      }
      new Promise(async (resolve, reject) => {
        try {
          MembersController.validateRoles(req, instance);
          if (!instance.roles[req.params.role]) {
            throw new Error('This role do not already exists, please use a POST request')
          }
          instance.roles[req.params.role] = req.body.actions;
          resolve(null);
        } catch (error) {
          reject(error);
        }
      }).then(() => {
        if (send) {
          res.send(instance.roles);
        } else {
          res.locals.element = instance;
          next();
        }
      }).catch(next);
    }
  }

  // exemple:  DELETE /shop/admin/:shopId/members/:userId
  public static removeRoleController(localsProperty: string, send: boolean = true) {
    return (req: Request, res: Response, next: NextFunction) => {
      const instance = MembersController.getInstance(res, localsProperty);
      if (instance === null) {
        throw new Error('Invalid request');
      }
      new Promise(async (resolve, reject) => {
        try {
          if (!instance.roles[req.params.role]) {
            throw new Error('This role do not exists');
          }
          delete instance.roles[req.params.role];
          await instance.update(['roles']);
          resolve(null);
        } catch (error) {
          reject(error);
        }
      }).then(() => {
        if (send) {
          res.send(instance.roles);
        } else {
          res.locals.element = instance;
          next();
        }
      }).catch(next);
    }
  }

  public static fetchUserActions(localsProperty: string, addPolicyForActions?: Array<string>) {
    return (req: Request, res: Response, next: NextFunction) => {
      const instance = MembersController.getInstance(res, localsProperty);
      if (Array.isArray(addPolicyForActions)) {
        if (!res.locals.policy) {
          res.locals.policy = new Policy();
        }
        const policy: Policy = res.locals.policy;
        policy.extend(PolicyFactory.memberCanDoAction(addPolicyForActions));
      }
      if (instance === null) {
        res.locals.userAction = [];
        return next();
      }
      new Promise(async (resolve, reject) => {
        try {
          if (!res.locals.user) {
            await AuthMiddleware.tryToAuthenticate(req, res);
          }
          if (!res.locals.user) {
            res.locals.userAction = [];
            return resolve(null);
          }
          const user = res.locals.user as UserModel;
          const userIdString = user._id.toHexString();
          let roles: Array<string> = [];
          for (let member of instance.members) {
            if (member.userId.toHexString() === userIdString) {
              roles = member.roles;
              break;
            }
          }
          if (roles.indexOf(instance.superAdminRole) !== -1) {
            res.locals.actions = instance.actions();
          } else {
            res.locals.actions = roles.reduce((actions, role) => {
              const newActions = instance.roles[role] || [];
              newActions.map((action) => {
                if (actions.indexOf(action) === -1) actions.push(action);
              });
              return actions;
            }, [] as string[]);
          }
          resolve(null);
        } catch (error) {
          reject(error)
        }
      }).then(() => {
        next();
      }).catch(next);
    } 
  }
}