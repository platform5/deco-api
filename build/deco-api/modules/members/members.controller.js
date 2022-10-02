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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersController = void 0;
const auth_middleware_1 = require("./../user/auth.middleware");
const user_model_1 = require("./../user/user.model");
const __1 = require("../../");
const members_abstract_1 = require("./members.abstract");
class MembersController {
    static validateUserIdAndRoles(req, instance, validateRoles = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId;
            if (!req.params.userId) {
                throw new Error('Missing userId');
            }
            try {
                userId = new __1.ObjectId(req.params.userId);
            }
            catch (error) {
                throw new Error('Invalid userId');
            }
            if (validateRoles) {
                if (!req.body.roles) {
                    throw new Error('Missing roles');
                }
                if (!Array.isArray(req.body.roles)) {
                    throw new Error('Invalid roles');
                }
                req.body.roles.map((i) => {
                    if (typeof i !== 'string')
                        throw new Error('Invalid roles');
                    if (i !== instance.superAdminRole && !instance.roles[i])
                        throw new Error('Invalid roles');
                });
            }
            const user = yield user_model_1.UserModel.getOneWithQuery({ appId: instance.appId, _id: userId });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        });
    }
    static getInstance(res, localsProperty) {
        if (!res.locals[localsProperty]) {
            return null;
        }
        const rightInstance = res.locals[localsProperty] instanceof members_abstract_1.Members;
        if (!rightInstance) {
            res.locals.userAction = [];
            return null;
        }
        return res.locals[localsProperty];
    }
    // exemple:  GET /shop/admin/:shopId/members
    static getMembersController(localsProperty, send = true) {
        return (req, res, next) => {
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
        };
    }
    // exemple:  POST /shop/admin/:shopId/members/:userId (with req.body.roles as Array<string>)
    static addMemberController(localsProperty, send = true) {
        return (req, res, next) => {
            const instance = MembersController.getInstance(res, localsProperty);
            if (instance === null) {
                throw new Error('Invalid request');
            }
            new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const user = yield MembersController.validateUserIdAndRoles(req, instance);
                    for (let member of instance.members) {
                        if (member.userId.toHexString() === req.params.userId) {
                            throw new Error('This user is already a member, please use a PUT request');
                        }
                    }
                    instance.members.push({
                        userId: user._id,
                        roles: req.body.roles
                    });
                    yield instance.update(['members']);
                    resolve(null);
                }
                catch (error) {
                    reject(error);
                }
            })).then(() => {
                if (send) {
                    res.send(instance.members);
                }
                else {
                    res.locals.element = instance;
                    next();
                }
            }).catch(next);
        };
    }
    // exemple:  PUT /shop/admin/:shopId/members/:userId (with req.body.roles as Array<string>)
    static editMemberController(localsProperty, send = true) {
        return (req, res, next) => {
            const instance = MembersController.getInstance(res, localsProperty);
            if (instance === null) {
                throw new Error('Invalid request');
            }
            new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield MembersController.validateUserIdAndRoles(req, instance);
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
                    yield instance.update(['members']);
                    resolve(null);
                }
                catch (error) {
                    reject(error);
                }
            })).then(() => {
                if (send) {
                    res.send(instance.members);
                }
                else {
                    res.locals.element = instance;
                    next();
                }
            }).catch(next);
        };
    }
    // exemple:  DELETE /shop/admin/:shopId/members/:userId
    static removeMemberController(localsProperty, send = true) {
        return (req, res, next) => {
            const instance = MembersController.getInstance(res, localsProperty);
            if (instance === null) {
                throw new Error('Invalid request');
            }
            new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield MembersController.validateUserIdAndRoles(req, instance, false);
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
                    yield instance.update(['members']);
                    resolve(null);
                }
                catch (error) {
                    reject(error);
                }
            })).then(() => {
                if (send) {
                    res.send(instance.members);
                }
                else {
                    res.locals.element = instance;
                    next();
                }
            }).catch(next);
        };
    }
    static validateRoles(req, instance) {
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
        req.body.actions.map((i) => {
            if (typeof i !== 'string')
                throw new Error('Invalid actions');
            if (instance.actions().indexOf(i) === -1)
                throw new Error('Invalid actions');
        });
    }
    // exemple:  POST /shop/admin/:shopId/members/:userId (with req.body.roles as Array<string>)
    static addRoleController(localsProperty, send = true) {
        return (req, res, next) => {
            const instance = MembersController.getInstance(res, localsProperty);
            if (instance === null) {
                throw new Error('Invalid request');
            }
            new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    MembersController.validateRoles(req, instance);
                    if (instance.roles[req.params.role]) {
                        throw new Error('This role already exists, please use a PUT request');
                    }
                    instance.roles[req.params.role] = req.body.actions;
                    yield instance.update(['roles']);
                    resolve(null);
                }
                catch (error) {
                    return reject(error);
                }
            })).then(() => {
                if (send) {
                    res.send(instance.roles);
                }
                else {
                    res.locals.element = instance;
                    next();
                }
            }).catch(next);
        };
    }
    // exemple:  PUT /shop/admin/:shopId/members/:userId (with req.body.roles as Array<string>)
    static editRoleController(localsProperty, send = true) {
        return (req, res, next) => {
            const instance = MembersController.getInstance(res, localsProperty);
            if (instance === null) {
                throw new Error('Invalid request');
            }
            new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    MembersController.validateRoles(req, instance);
                    if (!instance.roles[req.params.role]) {
                        throw new Error('This role do not already exists, please use a POST request');
                    }
                    instance.roles[req.params.role] = req.body.actions;
                    yield instance.update(['roles']);
                    resolve(null);
                }
                catch (error) {
                    reject(error);
                }
            })).then(() => {
                if (send) {
                    res.send(instance.roles);
                }
                else {
                    res.locals.element = instance;
                    next();
                }
            }).catch(next);
        };
    }
    // exemple:  DELETE /shop/admin/:shopId/members/:userId
    static removeRoleController(localsProperty, send = true) {
        return (req, res, next) => {
            const instance = MembersController.getInstance(res, localsProperty);
            if (instance === null) {
                throw new Error('Invalid request');
            }
            new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!instance.roles[req.params.role]) {
                        throw new Error('This role do not exists');
                    }
                    delete instance.roles[req.params.role];
                    yield instance.update(['roles']);
                    resolve(null);
                }
                catch (error) {
                    reject(error);
                }
            })).then(() => {
                if (send) {
                    res.send(instance.roles);
                }
                else {
                    res.locals.element = instance;
                    next();
                }
            }).catch(next);
        };
    }
    static fetchUserActions(localsProperty, addPolicyForActions) {
        return (req, res, next) => {
            const instance = MembersController.getInstance(res, localsProperty);
            if (Array.isArray(addPolicyForActions)) {
                if (!res.locals.policy) {
                    res.locals.policy = new __1.Policy();
                }
                const policy = res.locals.policy;
                policy.extend(__1.PolicyFactory.memberCanDoAction(addPolicyForActions));
            }
            if (instance === null) {
                res.locals.userAction = [];
                return next();
            }
            new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!res.locals.user) {
                        yield auth_middleware_1.AuthMiddleware.tryToAuthenticate(req, res);
                    }
                    if (!res.locals.user) {
                        res.locals.userAction = [];
                        return resolve(null);
                    }
                    const user = res.locals.user;
                    const userIdString = user._id.toHexString();
                    let roles = [];
                    for (let member of instance.members) {
                        if (member.userId.toHexString() === userIdString) {
                            roles = member.roles;
                            break;
                        }
                    }
                    if (roles.indexOf(instance.superAdminRole) !== -1) {
                        res.locals.userAction = instance.actions();
                    }
                    else {
                        res.locals.userAction = roles.reduce((actions, role) => {
                            const newActions = instance.roles[role] || [];
                            newActions.map((action) => {
                                if (actions.indexOf(action) === -1)
                                    actions.push(action);
                            });
                            return actions;
                        }, []);
                    }
                    resolve(null);
                }
                catch (error) {
                    reject(error);
                }
            })).then(() => {
                next();
            }).catch(next);
        };
    }
}
exports.MembersController = MembersController;
//# sourceMappingURL=members.controller.js.map