"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControllerMiddlware = void 0;
const controller_1 = require("./../../middlewares/controller");
let debug = require('debug')('app:middleware:byapp');
class AccessControllerMiddlware extends controller_1.ControllerMiddleware {
    constructor() {
        super(...arguments);
        this.readByApp = true;
        this.writeByApp = true;
        this.readByCreator = false;
        this.writeByCreator = false;
        this.readByUsersArray = false;
        this.writeByUsersArray = false;
        this.readByUsersRoles = false;
        this.writeByUsersRoles = false;
        this.readUsersRoles = [];
        this.writeUsersRoles = [];
        this.enableRelatedToAppId = false;
    }
    /*
    restrictByApp: boolean = true;
    restrictByCreator: boolean = false;
    restrictByUsersArray: boolean = false;
    restrictByUsersRoles: boolean = false;
    userRoles: Array<string> = [];
    */
    extendGetAllQuery(query, req, res) {
        if (this.readByApp) {
            if (!res.locals.app && !res.locals.dynamicModelApp)
                throw new Error('Missing app');
            let appId = (res.locals.dynamicModelApp) ? res.locals.dynamicModelApp._id : res.locals.app._id;
            let readQuery = { $or: [{ appId: appId }] };
            if (this.enableRelatedToAppId) {
                readQuery.$or.push({ relatedToAppId: appId });
            }
            query.addQuery(readQuery);
        }
        if (this.readByCreator) {
            if (!res.locals.user)
                throw new Error('Missing user');
            query.addQuery({ _createdBy: res.locals.user._id });
        }
        if (this.readByUsersArray) {
            if (!res.locals.user)
                throw new Error('Missing user');
            query.addQuery({ users: res.locals.user._id });
        }
        if (this.readByUsersRoles) {
            if (!res.locals.user)
                throw new Error('Missing user');
            let readQuery = {
                users: { $elemMatch: {
                        _id: res.locals.user._id,
                        roles: { $elemMatch: {
                                $in: this.readUsersRoles
                            } }
                    } }
            };
            query.addQuery(readQuery);
        }
        return Promise.resolve();
    }
    getOneElement(element, req, res) {
        if (this.readByApp)
            this.checkAppId(element, req, res);
        if (this.readByCreator)
            this.checkCreatoriId(element, req, res);
        if (this.readByUsersArray)
            this.checkUsersArray(element, req, res);
        if (this.readByUsersRoles)
            this.checkUsersRoles(element, req, res, this.readUsersRoles);
        return Promise.resolve(element);
    }
    postElement(element, req, res) {
        if (this.writeByApp) {
            if (!res.locals.app && !res.locals.dynamicModelApp)
                throw new Error('Missing app');
            element.appId = (res.locals.dynamicModelApp) ? res.locals.dynamicModelApp._id : res.locals.app._id;
        }
        if (this.writeByCreator) {
            if (!res.locals.user)
                throw new Error('Missing user');
            element._createdBy = res.locals.user._id;
        }
        if (this.writeByUsersArray) {
            if (!res.locals.user)
                throw new Error('Missing user');
            let e = element;
            if (!e.users || !Array.isArray(e.users) || e.users.length === 0)
                e.users = [res.locals.user._id];
        }
        if (this.writeByUsersRoles) {
            if (!res.locals.user)
                throw new Error('Missing user');
            let e = element;
            if (!e.users || !Array.isArray(e.users) || e.users.length === 0)
                e.users = [{
                        _id: res.locals.user._id,
                        roles: this.writeUsersRoles
                    }];
        }
        return Promise.resolve(element);
    }
    putElement(element, req, res) {
        if (this.writeByApp)
            this.checkAppId(element, req, res);
        if (this.writeByCreator)
            this.checkCreatoriId(element, req, res);
        if (this.writeByUsersArray)
            this.checkUsersArray(element, req, res);
        if (this.readByUsersRoles)
            this.checkUsersRoles(element, req, res, this.writeUsersRoles);
        return Promise.resolve(element);
    }
    deleteElement(element, req, res) {
        if (this.writeByApp)
            this.checkAppId(element, req, res);
        if (this.writeByCreator)
            this.checkCreatoriId(element, req, res);
        if (this.writeByUsersArray)
            this.checkUsersArray(element, req, res);
        if (this.readByUsersRoles)
            this.checkUsersRoles(element, req, res, this.writeUsersRoles);
        return Promise.resolve(element);
    }
    checkAppId(element, req, res) {
        if (!res.locals.app && !res.locals.dynamicModelApp)
            throw new Error('Missing app');
        let e = element;
        if (!e.appId)
            throw new Error('Access denied');
        if (e.appId.toString() !== ((res.locals.dynamicModelApp) ? res.locals.dynamicModelApp._id : res.locals.app._id).toString())
            throw new Error('Access denied');
    }
    checkCreatoriId(element, req, res) {
        if (!res.locals.user)
            throw new Error('Missing user');
        if (!element._createdBy)
            throw new Error('Access denied');
        if (element._createdBy.toString() !== res.locals.user._id.toString())
            throw new Error('Access denied');
    }
    checkUsersArray(element, req, res) {
        if (!res.locals.user)
            throw new Error('Missing user');
        let e = element;
        if (!e.users)
            throw new Error('Access denied');
        for (let index in e.users || []) {
            let id = e.users[index];
            if (id.toString() === res.locals.user._id.toString())
                return true;
        }
        throw new Error('Access denied');
    }
    checkUsersRoles(element, req, res, roles) {
        if (!res.locals.user)
            throw new Error('Missing user');
        let e = element;
        if (!e.users)
            throw new Error('Access denied');
        for (let index in e.users || []) {
            let user = e.users[index];
            if (user._id.toString() === res.locals.user._id.toString()) {
                for (let roleIndex in roles) {
                    let role = roles[roleIndex];
                    if (user.roles.indexOf(role) !== -1)
                        return true;
                }
            }
        }
        throw new Error('Access denied');
    }
}
exports.AccessControllerMiddlware = AccessControllerMiddlware;
//# sourceMappingURL=access.middleware.controller.js.map