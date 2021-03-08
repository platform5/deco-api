"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../");
const moment = require("moment");
let debug = require('debug')('app:middleware:app');
class AppMiddleware {
    static fetchWithPrivateKey(req, res, next) {
        let privateKey = req.query.apiKey;
        if (!privateKey)
            return next(new Error('Missing apiKey'));
        let query = {
            "privateKeys": {
                $elemMatch: {
                    key: privateKey,
                    active: true,
                    $or: [
                        { expires: null },
                        { expires: { $exists: false } },
                        { expires: { $gt: moment().toDate() } }
                    ]
                }
            }
        };
        __1.AppModel.getOneWithQuery(query).then((element) => {
            if (!element)
                return next(new Error('Invalid API Key'));
            res.locals.app = element;
            next();
        }).catch(next);
    }
    static fetchWithPublicKey(req, res, next) {
        let publicKey = req.query.apiKey;
        if (!publicKey)
            return next(new Error('Missing apiKey'));
        let query = {
            "publicKeys": {
                $elemMatch: {
                    key: publicKey,
                    active: true,
                    $or: [
                        { expires: null },
                        { expires: { $exists: false } },
                        { expires: { $gt: moment().toDate() } }
                    ]
                }
            }
        };
        __1.AppModel.getOneWithQuery(query).then((element) => {
            if (!element)
                return next(new Error('Invalid API Key'));
            res.locals.app = element;
            req.body.appId = res.locals.app._id.toString();
            next();
        }).catch(next);
    }
    static fetchParamApp(requireUserAccessToParamApp = true) {
        return (req, res, next) => {
            if (!req.params || !req.params.appId)
                return next(new Error('Missing appId - did you forget to add a :appId in the route ?'));
            if (!res.locals.app)
                return next(new Error('Missing app - did you forget to fetchWithPublicKey'));
            let rightInstance = res.locals.app instanceof __1.AppModel;
            if (!rightInstance)
                return next(new Error('Invalid app, not instance of AppModel'));
            if (requireUserAccessToParamApp) {
                if (!res.locals.user)
                    return next(new Error('Missing user - did you forget to authenticate'));
                rightInstance = res.locals.user instanceof __1.UserModel;
                if (!rightInstance)
                    return next(new Error('Invalid user, not instance of UserModel'));
            }
            try {
                let appId = new __1.ObjectId(req.params.appId);
                let query = {
                    _id: appId,
                    appId: res.locals.app._id
                };
                if (requireUserAccessToParamApp) {
                    query["users._id"] = res.locals.user._id;
                }
                __1.AppModel.getOneWithQuery(query).then((a) => {
                    let app = a;
                    if (!app)
                        return next(new Error('Invalid appId or access denied'));
                    res.locals.paramApp = app;
                    let query = (res.locals.query) ? res.locals.query : new __1.Query();
                    const rightInstance = query instanceof __1.Query;
                    if (!rightInstance)
                        throw new Error('res.locals.query is not a valid Query object');
                    query.addQuery({ appId: res.locals.app._id });
                    next();
                }).catch(next);
            }
            catch (e) {
                return next(new Error('Invalid appId'));
            }
        };
    }
    static addAppIdToBody(prop = 'appId') {
        return (req, res, next) => {
            var _a;
            debug('[DEPRECATION WARNING]', 'addAppIdToBody should not be used as appId is automatically added to body in fetchWithPublicKey');
            debug(' - Request url [', req.method, ']', req.originalUrl);
            if (req.body.appId.toString() === ((_a = res.locals.app) === null || _a === void 0 ? void 0 : _a._id.toString())) {
                debug(' - By the way, in this request the body appId was already set.');
            }
            if (!res.locals.app)
                return next(new Error('Missing App - did you forget to add a middleware to fetch the app?'));
            req.body[prop] = res.locals.app._id;
            next();
        };
    }
    static addAppIdFromParamsToBody(prop = 'appId') {
        return (req, res, next) => {
            if (!req.params || !req.params.appId)
                return next(new Error('Missing appId - did you forget to add a :appId in the route ?'));
            try {
                let appId = new __1.ObjectId(req.params.appId);
                req.body[prop] = appId;
                return next();
            }
            catch (e) {
                return next(new Error('Invalid appId'));
            }
        };
    }
    static outputKey() {
        return (req, res, next) => {
            if (!res.locals.app)
                return next(new Error('Missing App - did you forget to add a middleware to fetch the app?'));
            if (!res.locals.element)
                return next(new Error('Missing Element - did you forget to add a getOne middleware?'));
            if (typeof res.locals.element !== 'object')
                return next(new Error('Invalid Element (not object)'));
            if (req.params.type !== 'private' && req.params.type !== 'public')
                return next(new Error('Invalid request'));
            let type = req.params.type;
            let index = parseInt(req.params.index, 10);
            if (index.toString() !== req.params.index)
                return next(new Error('Invalid request'));
            let keys = res.locals.element[`${type}Keys`];
            if (!keys || !Array.isArray(keys))
                return next(new Error('Invalid Key Property (missing or not array)'));
            if (keys.length < index + 1)
                return next(new Error('Invalid Key Property (missing requested index)'));
            let key = keys[index];
            res.send(key);
        };
    }
    static createKey() {
        return (req, res, next) => {
            if (!res.locals.app)
                return next(new Error('Missing App - did you forget to add a middleware to fetch the app?'));
            if (!res.locals.element)
                return next(new Error('Missing Element - did you forget to add a getOne middleware?'));
            if (typeof res.locals.element !== 'object')
                return next(new Error('Invalid Element (not object)'));
            if (req.params.type !== 'private' && req.params.type !== 'public')
                return next(new Error('Invalid request'));
            if (!req.body.name || typeof req.body.name !== 'string')
                return next(new Error('Missing or invalid key name'));
            let type = req.params.type;
            let key = {
                name: req.body.name,
                key: __1.AppModel.generateKey(),
                active: false,
            };
            let fields = [];
            if (type === 'private') {
                res.locals.element.privateKeys.push(key);
                fields = ['privateKeys'];
            }
            else if (type === 'public') {
                res.locals.element.publicKeys.push(key);
                fields = ['publicKeys'];
            }
            res.locals.element.update(fields).then((app) => {
                res.locals.element = app;
                next();
            }).catch(next);
        };
    }
    static editKey() {
        return (req, res, next) => {
            if (!res.locals.app)
                return next(new Error('Missing App - did you forget to add a middleware to fetch the app?'));
            if (!res.locals.element)
                return next(new Error('Missing Element - did you forget to add a getOne middleware?'));
            if (typeof res.locals.element !== 'object')
                return next(new Error('Invalid Element (not object)'));
            let rightInstance = (res.locals.element instanceof __1.AppModel);
            if (!rightInstance)
                return next(new Error('Invalid Element (not AppModel)'));
            if (req.params.type !== 'private' && req.params.type !== 'public')
                return next(new Error('Invalid request'));
            let type = req.params.type;
            let index = parseInt(req.params.index, 10);
            if (index.toString() !== req.params.index)
                return next(new Error('Invalid request'));
            let keys = res.locals.element[`${type}Keys`];
            if (!keys || !Array.isArray(keys))
                return next(new Error('Invalid Key Property (missing or not array)'));
            if (keys.length < index + 1)
                return next(new Error('Invalid Key Property (missing requested index)'));
            let key = keys[index];
            if (key.key && key.key.substr(-4) !== req.params.last4)
                return next(new Error('Invalid Key last4 and index'));
            if (req.body.name && typeof req.body.name === 'string')
                key.name = req.body.name;
            if (typeof req.body.active === 'boolean')
                key.active = req.body.active;
            if (req.body.expires && typeof req.body.expires === 'string') {
                let date = moment(req.body.expires);
                if (date.isValid())
                    key.expires = date.toDate();
            }
            let fields = [];
            if (type === 'private') {
                fields = ['privateKeys'];
            }
            else if (type === 'public') {
                fields = ['publicKeys'];
            }
            res.locals.element.update(fields).then((app) => {
                res.locals.element = app;
                next();
            }).catch(next);
        };
    }
    static deleteKey() {
        return (req, res, next) => {
            if (!res.locals.app)
                return next(new Error('Missing App - did you forget to add a middleware to fetch the app?'));
            if (!res.locals.element)
                return next(new Error('Missing Element - did you forget to add a getOne middleware?'));
            if (typeof res.locals.element !== 'object')
                return next(new Error('Invalid Element (not object)'));
            let rightInstance = (res.locals.element instanceof __1.AppModel);
            if (!rightInstance)
                return next(new Error('Invalid Element (not AppModel)'));
            if (req.params.type !== 'private' && req.params.type !== 'public')
                return next(new Error('Invalid request'));
            let type = req.params.type;
            let index = parseInt(req.params.index, 10);
            if (index.toString() !== req.params.index)
                return next(new Error('Invalid request'));
            let keys = res.locals.element[`${type}Keys`];
            if (!keys || !Array.isArray(keys))
                return next(new Error('Invalid Key Property (missing or not array)'));
            if (keys.length < index + 1)
                return next(new Error('Invalid Key Property (missing requested index)'));
            let key = keys[index];
            if (key.key && key.key.substr(-4) !== req.params.last4)
                return next(new Error('Invalid Key last4 and index'));
            keys.splice(index, 1);
            let fields = [];
            if (type === 'private') {
                fields = ['privateKeys'];
            }
            else if (type === 'public') {
                fields = ['publicKeys'];
            }
            res.locals.element.update(fields).then((app) => {
                res.locals.element = app;
                next();
            }).catch(next);
        };
    }
    static addUser() {
        return (req, res, next) => {
            if (!res.locals.paramApp)
                return next(new Error('Missing paramApp'));
            let app = res.locals.paramApp;
            for (let user of app.users) {
                if (user._id.toString() === req.params.userId)
                    return next(new Error('User is already invited in this app'));
            }
            __1.UserModel.getOneWithId(req.params.userId).then((user) => {
                if (!user)
                    throw new Error('User not found');
                let roles = [];
                if (req.body.roles && Array.isArray(req.body.roles)) {
                    for (let role of req.body.roles) {
                        roles.push(role.toString());
                    }
                }
                else if (req.body.roles && typeof req.body.roles === 'string') {
                    roles = [req.body.roles];
                }
                app.users.push({ _id: user._id, roles: roles });
                return app.update(['users']);
            }).then((app) => {
                res.locals.element = app;
                next();
            }).catch(next);
        };
    }
    static editUser() {
        return (req, res, next) => {
            if (!res.locals.paramApp)
                return next(new Error('Missing paramApp'));
            let app = res.locals.paramApp;
            let user;
            let userId;
            try {
                userId = new __1.ObjectId(req.params.userId);
            }
            catch (e) {
                return next(new Error('Invalid userId'));
            }
            let editedFields = [];
            __1.UserModel.getOneWithQuery({ appId: res.locals.paramApp._id, _id: userId }).then((u) => {
                if (!u)
                    throw new Error('User not found');
                user = u;
                if (req.body.roles && Array.isArray(req.body.roles)) {
                    let roles = [];
                    for (let role of req.body.roles) {
                        roles.push(role.toString());
                    }
                    user.roles = roles;
                    editedFields.push('roles');
                }
                else if (req.body.roles && typeof req.body.roles === 'string') {
                    let roles = [req.body.roles];
                    user.roles = roles;
                    editedFields.push('roles');
                }
                if (req.body.requireDoubleAuth !== undefined && typeof req.body.requireDoubleAuth === 'boolean') {
                    user.requireDoubleAuth = req.body.requireDoubleAuth;
                    editedFields.push('requireDoubleAuth');
                }
                if (editedFields.length) {
                    return user.update(editedFields).then((u) => {
                        user = u;
                        return user.output();
                    }).then((element) => {
                        res.locals.element = element;
                    });
                }
                return;
            }).then(() => {
                next();
            }).catch(next);
        };
    }
    static editParentUser() {
        return (req, res, next) => {
            if (!res.locals.paramApp)
                return next(new Error('Missing paramApp'));
            let app = res.locals.paramApp;
            let user;
            let found = false;
            let edited = false;
            for (let _user of app.users) {
                if (_user._id.toString() === req.params.userId) {
                    user = _user;
                    found = true;
                    if (req.body.roles && Array.isArray(req.body.roles)) {
                        let roles = [];
                        for (let role of req.body.roles) {
                            roles.push(role.toString());
                        }
                        user.roles = roles;
                        edited = true;
                    }
                    else if (req.body.roles && typeof req.body.roles === 'string') {
                        let roles = [req.body.roles];
                        user.roles = roles;
                        edited = true;
                    }
                    break;
                }
            }
            if (edited) {
                // when trying to update the users property, it generates an error (Model not set).
                // could it be that the user that we are trying to add is not in the app (as is its appId) and therefore it doesn't allow the placement here ??
                app.update(['users']).then((app) => {
                    res.locals.element = user;
                    return next();
                }).catch(next);
            }
            else {
                if (!found)
                    return next(new Error('User is not in the app'));
                next();
            }
        };
    }
    static removeUser() {
        return (req, res, next) => {
            if (!res.locals.paramApp)
                return next(new Error('Missing paramApp'));
            let app = res.locals.paramApp;
            let found = false;
            let k = 0;
            let index = -1;
            for (let user of app.users) {
                if (user._id.toString() === req.params.userId) {
                    found = true;
                    index = k;
                    break;
                }
                k++;
            }
            if (found && k !== -1) {
                app.users.splice(index, 1);
                app.update(['users']).then((app) => {
                    res.locals.element = app;
                    next();
                }).catch(next);
            }
            else {
                return next(new Error('User is not in the app'));
            }
        };
    }
}
exports.AppMiddleware = AppMiddleware;
//# sourceMappingURL=app.middleware.js.map