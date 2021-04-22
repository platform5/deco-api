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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const change_email_or_mobile_token_model_1 = require("./change-email-or-mobile-token.model");
const reset_password_token_model_1 = require("./reset-password-token.model");
const user_model_1 = require("./user.model");
const access_token_model_1 = require("./access-token.model");
const __1 = require("../../");
const moment_1 = __importDefault(require("moment"));
let debug = require('debug')('app:middleware:auth');
class AuthMiddleware {
    static getToken(req, res, next) {
        let requestType;
        if (req.body && req.body.username && req.body.password)
            requestType = 'user-password';
        else if (req.body && req.body.token && req.body.code)
            requestType = 'double-auth';
        else
            return next(new Error('Invalid request'));
        let tokenPromise;
        if (requestType === 'user-password') {
            if (typeof req.body.username !== 'string' || typeof req.body.password !== 'string')
                return next(new Error('Invalid request'));
            tokenPromise = user_model_1.UserModel.authUser(res.locals.app._id, req.body.username, req.body.password).then((user) => {
                if (!user)
                    throw new Error('Invalid username or password');
                let token;
                if (res.locals.app.requireDoubleAuth || user.requireDoubleAuth) {
                    token = new access_token_model_1.AccessTokenModel();
                    token.init('double-auth', user._id, res.locals.app._id, 10, 'minutes');
                    // todo: notify user of his double auth code
                    return AuthMiddleware.notifyUserWithDoubleAuthCode(res.locals.app, req.body.username, user, token, req)
                        .then(() => token.insert());
                }
                else {
                    token = new access_token_model_1.AccessTokenModel();
                    token.init('access', user._id, res.locals.app._id, 2, 'weeks');
                    res.locals.user = user;
                    return token.insert();
                }
            });
        }
        else if (requestType === 'double-auth') {
            if (typeof req.body.token !== 'string' || typeof req.body.code !== 'string')
                return next(new Error('Invalid request'));
            tokenPromise = access_token_model_1.AccessTokenModel.getOneWithQuery({ appId: res.locals.app._id, token: req.body.token, code: req.body.code }).then((validationToken) => {
                if (!validationToken)
                    throw new Error('Invalid code or token');
                if (moment_1.default(validationToken.expires).isBefore(moment_1.default()))
                    throw new Error('Token has expired');
                if (validationToken.userId === null)
                    throw new Error('Broken token');
                // validation token is valid, we can now get user and create access token
                return user_model_1.UserModel.getOneWithId(validationToken.userId);
            }).then((user) => {
                if (!user)
                    throw new Error('Broken token');
                let token = new access_token_model_1.AccessTokenModel();
                token.init('access', user._id, res.locals.app._id, 2, 'weeks');
                res.locals.user = user;
                return token.insert();
            });
        }
        else {
            return new Error('Invalid request');
        }
        tokenPromise.then((accessTokenElement) => {
            return accessTokenElement.output();
        }).then((accessTokenElement) => {
            res.send(accessTokenElement);
        }).catch(next);
    }
    static notifyUserWithDoubleAuthCode(app, username, user, token, req) {
        let method = app.doubleAuthMethod;
        if (!method || app.doubleAuthMethod === 'auto') {
            if (username === user.email && user.mobile)
                method = 'sms';
            else if (username === user.mobile)
                method = 'email';
        }
        if (!method)
            method = 'email';
        let service;
        let destination;
        if (method === 'email') {
            let emailServiceForApp = __1.NotificationEmailService.serviceForApp(app);
            service = emailServiceForApp;
            destination = user.email;
        }
        else {
            service = __1.smsService;
            destination = user.mobile;
        }
        return service.send(destination, 'double-auth', {
            app: app,
            locale: req.body.locale,
            user: user,
            token: token,
            device: {
                ip: req.ip,
                userAgent: req.headers['user-agent']
            }
        }).then((response) => {
            if (!response)
                throw new Error('Failed to send validation notification');
            return true;
        });
    }
    static revokeToken(req, res, next) {
        if (!req.body || !req.body.token)
            return next(new Error('Invalid request'));
        if (typeof req.body.token !== 'string')
            return next(new Error('Invalid request'));
        access_token_model_1.AccessTokenModel.getOneWithQuery({ token: req.body.token }).then((accessTokenElement) => {
            if (!accessTokenElement)
                return Promise.resolve(accessTokenElement);
            return accessTokenElement.remove();
        }).then((element) => {
            res.sendStatus(204);
        }).catch(next);
    }
    static tryAuthentication(appId, token) {
        return access_token_model_1.AccessTokenModel.getOneWithQuery({ appId: appId, token: token }).then((accessToken) => {
            if (!accessToken)
                throw new Error('Token not found');
            let at = accessToken;
            if (moment_1.default(at.expires).isBefore(moment_1.default()))
                throw new Error('Token has expired');
            // here we have a valid token, we can fetch the user
            if (!at.userId)
                throw new Error('Token is missing userId');
            return user_model_1.UserModel.getOneWithId(at.userId);
        }).then((user) => {
            if (!user)
                throw new Error('User not found');
            return user;
        });
    }
    static tryToAuthenticate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!res.locals.app)
                throw new Error('Missing App');
            if (!req.headers.authorization)
                return;
            if (res.locals._triedToAuthenticate)
                return;
            let match = req.headers.authorization.match(/Bearer ([a-zA-Z0-9]*)/);
            if (!match)
                return;
            let token = match[1];
            res.locals._triedToAuthenticate = true;
            return AuthMiddleware.tryAuthentication(res.locals.app._id, token).then((user) => {
                res.locals.user = user;
            }).catch((error) => {
                // ignore error
                return;
            });
        });
    }
    static authenticate(req, res, next) {
        if (!res.locals.app)
            return next(new Error('Missing App'));
        if (!req.headers.authorization)
            return next(new Error('Missing authorization token'));
        if (res.locals._triedToAuthenticate)
            return next('Access denied');
        let match = req.headers.authorization.match(/Bearer ([a-zA-Z0-9]*)/);
        if (!match)
            return next(new Error('Invalid authorization value'));
        let token = match[1];
        res.locals._triedToAuthenticate = true;
        AuthMiddleware.tryAuthentication(res.locals.app._id, token).then((user) => {
            res.locals.user = user;
            next();
        }).catch(next);
    }
    static authenticateWithoutError(req, res, next) {
        if (!res.locals.app)
            return next(new Error('Missing App'));
        if (!req.headers.authorization)
            return next();
        if (res.locals._triedToAuthenticate)
            return next();
        let match = req.headers.authorization.match(/Bearer ([a-zA-Z0-9]*)/);
        if (!match)
            return next();
        let token = match[1];
        res.locals._triedToAuthenticate = true;
        AuthMiddleware.tryAuthentication(res.locals.app._id, token).then((user) => {
            res.locals.user = user;
            next();
        }).catch((error) => {
            // ignore error
            next();
        });
    }
    static addAppIdInQuery(req, res, next) {
        debug('[DEPRECATION WARNING]', 'addAppIdToBody should not be used as appId is automatically added to body in fetchWithPublicKey');
        if (!res.locals.app)
            return next(new Error('Missing App'));
        let query = (res.locals.query) ? res.locals.query : new __1.Query();
        if (query instanceof __1.Query !== true)
            return next(new Error('res.locals.query is not a valid Query object'));
        query.addQuery({ appId: res.locals.app._id });
        next();
    }
    static addAppIdFromParamsToQuery(req, res, next) {
        if (!req.params || !req.params.appId)
            return next(new Error('Missing appId - did you forget to add a :appId in the route ?'));
        let query = (res.locals.query) ? res.locals.query : new __1.Query();
        if (query instanceof __1.Query !== true)
            return next(new Error('res.locals.query is not a valid Query object'));
        try {
            let appId = new __1.ObjectId(req.params.appId);
            query.addQuery({ appId: appId });
            return next();
        }
        catch (e) {
            return next(new Error('Invalid appId'));
        }
    }
    // Check if the current logged in user has a role requested by the given prop in the app fetched by the apiKey
    // detected with the apiKey
    static checkUserRoleAccess(prop) {
        return (req, res, next) => {
            if (!res.locals.app)
                return next(new Error('Missing App - did you forget to add a middleware to fetch the app?'));
            if (!res.locals.user)
                return next(new Error('Missing User - did you forget to add a middleware to fetch the user?'));
            //let parentAppId: ObjectId = res.locals.app.appId;
            //let appId: ObjectId = res.locals.app._id;
            //let userId: ObjectId = res.locals.user._id;
            let authorizedRoles = res.locals.app[prop] || [];
            for (let role of res.locals.user.roles || []) {
                if (authorizedRoles.indexOf(role) !== -1)
                    return next();
            }
            return next(new Error('Access denied'));
        };
    }
    // Check if the current logged in user has a role requested by the given prop in the paramApp (:appId)
    // This will not check the role of the user in res.locals.user but in the paramApp.users array
    static checkRoleViaParamApp(roles) {
        return (req, res, next) => {
            if (!res.locals.user)
                return next(new Error('Missing User - did you forget to add a middleware to fetch the user?'));
            if (!res.locals.paramApp)
                return next(new Error('Missing paramApp - did you forget to add a middleware to fetch the param app?'));
            let app = res.locals.paramApp;
            if (!app.users || !Array.isArray(app.users) || app.users.length === 0)
                return next(new Error('Access denied'));
            if (typeof roles === 'string')
                roles = [roles];
            for (let userIndex in app.users) {
                let user = app.users[userIndex];
                if (user._id.toString() === res.locals.user._id.toString()) {
                    for (let role of roles) {
                        if (user.roles.indexOf(role) !== -1)
                            return next();
                    }
                    break;
                }
            }
            return next(new Error('Access denied'));
        };
    }
    static allowOnlyRoles(roles = []) {
        return (req, res, next) => {
            if (!res.locals.user)
                return next(new Error('Missing User - did you forget to add a middleware to fetch the user?'));
            if (!res.locals.user.roles)
                return next(new Error('Access denied'));
            if (!Array.isArray(res.locals.user.roles))
                return next(new Error('Access denied'));
            if (res.locals.user.roles.length === 0)
                return next(new Error('Access denied'));
            for (let index in roles) {
                let role = roles[index];
                if (res.locals.user.roles.indexOf(role) !== -1)
                    return next();
            }
            return next(new Error('Access denied'));
        };
    }
    static forgotPassword(req, res, next) {
        if (!req.body || !req.body.q)
            return next(new Error('Invalid request'));
        if (typeof req.body.q !== 'string')
            return next(new Error('Invalid request'));
        let query = {
            appId: res.locals.app._id
        };
        let qIs;
        if (req.body.q.indexOf('@') !== -1) {
            // q is an email
            query.email = req.body.q.toLowerCase();
            query.emailValidated = true;
            qIs = 'email';
        }
        else {
            // q is a mobile
            query.mobile = req.body.q;
            query.mobileValidated = true;
            qIs = 'mobile';
        }
        user_model_1.UserModel.getOneWithQuery(query).then((user) => {
            if (!user)
                return next(new Error('User not found'));
            let token = new reset_password_token_model_1.ResetPasswordTokenModel();
            token.init(user._id, res.locals.app._id);
            if (qIs === 'email' && req.body.q.match(/^test([0-9]{0,4})@decoapi\.com$/)) {
                token.code = req.body.q + 'a1b2c3'; // use for test with emails such as test01@decoapi.com or test843@decoapi.com
            }
            if (qIs === 'mobile' && req.body.q.match(/^\+4170([0-9]{7})$/)) {
                token.code = req.body.q + 'a1b2c3'; // use for test for mobiles such as 0702567760
            }
            return token.insert().then((token) => {
                let service;
                let destination;
                if (qIs === 'email') {
                    let emailServiceForApp = __1.NotificationEmailService.serviceForApp(res.locals.app);
                    service = emailServiceForApp;
                }
                else {
                    service = __1.smsService;
                }
                destination = req.body.q;
                if (token.code && token.code.substr(-6) === `a1b2c3`)
                    return Promise.resolve(token);
                return service.send(destination, 'reset-password-code', {
                    app: res.locals.app,
                    locale: req.body.locale,
                    user: user,
                    token: token,
                    device: {
                        ip: req.ip,
                        userAgent: req.headers['user-agent']
                    }
                }).then((response) => {
                    if (!response)
                        throw new Error('Failed to send reset password notification');
                    return token;
                });
            });
        }).then(token => token.output()).then(token => res.send(token)).catch(next);
    }
    static resetPassword(req, res, next) {
        if (!req.body || !req.body.token || !req.body.code || !req.body.newPassword)
            return next(new Error('Invalid request'));
        if (typeof req.body.token !== 'string')
            return next(new Error('Invalid request'));
        if (typeof req.body.code !== 'string')
            return next(new Error('Invalid request'));
        if (typeof req.body.newPassword !== 'string')
            return next(new Error('Invalid request'));
        reset_password_token_model_1.ResetPasswordTokenModel.getOneWithQuery({ appId: res.locals.app._id, token: req.body.token, code: req.body.code }).then((resetToken) => {
            if (!resetToken)
                throw new Error('Token not found');
            let rt = resetToken;
            if (moment_1.default(rt.expires).isBefore(moment_1.default()))
                throw new Error('Token has expired');
            // here we have a valid token, we can fetch the user
            if (!rt.userId)
                throw new Error('Invalid User');
            return user_model_1.UserModel.getOneWithId(rt.userId);
        }).then((user) => {
            if (!user)
                throw new Error('User not found');
            user.generateHash(req.body.newPassword);
            return user.update();
        }).then(user => user.output()).then(user => res.send(user)).catch(next);
    }
    static passwordChange(req, res, next) {
        if (!res.locals.user)
            return next(new Error('Invalid request'));
        if (!req.body.currentPassword || !req.body.newPassword)
            return next(new Error('Invalid request'));
        if (typeof req.body.currentPassword !== 'string')
            return next(new Error('Invalid request'));
        if (typeof req.body.newPassword !== 'string')
            return next(new Error('Invalid request'));
        user_model_1.UserModel.authUser(res.locals.user.appId, res.locals.user.email, req.body.currentPassword).then((user) => {
            if (!user)
                throw new Error('Wrong current password');
            user.generateHash(req.body.newPassword);
            return user.update(['hash', 'hashUpdateDate']);
        }).then((user) => {
            if (user) {
                res.sendStatus(204);
                return;
            }
            throw new Error('Unkown error');
        }).catch(next);
    }
    static requestEmailOrMobileChange(type) {
        return (req, res, next) => {
            if (!res.locals.user)
                return next(new Error('Invalid request'));
            if (!res.locals.app)
                return next(new Error('Invalid request'));
            if (!req.body[type])
                return next(new Error('Invalid request'));
            if (typeof req.body[type] !== 'string')
                return next(new Error('Invalid request'));
            let token = new change_email_or_mobile_token_model_1.ChangeEmailOrMobileTokenModel;
            token.init(res.locals.user._id, res.locals.app._id, 20, 'minutes');
            token.set(type, req.body[type]);
            if (type === 'email' && req.body[type].match(/^test([0-9]{0,4})@decoapi\.com$/)) {
                token.code = req.body[type] + 'a1b2c3'; // use for test with emails such as test01@decoapi.com or test843@decoapi.com
            }
            if (type === 'mobile' && req.body[type].match(/^\+4170([0-9]{7})$/)) {
                token.code = req.body[type] + 'a1b2c3'; // use for test for mobiles such as 0702567760
            }
            token.insert().then((token) => {
                if (!token)
                    throw new Error('Unkown error');
                let service;
                let destination;
                if (type === 'email') {
                    let emailServiceForApp = __1.NotificationEmailService.serviceForApp(res.locals.app);
                    service = emailServiceForApp;
                }
                else if (type === 'mobile') {
                    service = __1.smsService;
                }
                destination = req.body[type];
                if (token.code && token.code.substr(-6) === `a1b2c3`)
                    return token.output();
                return service.send(destination, 'change-email-or-mobile-code', {
                    app: res.locals.app,
                    locale: req.body.locale,
                    user: res.locals.user,
                    token: token,
                    type: type,
                    device: {
                        ip: req.ip,
                        userAgent: req.headers['user-agent']
                    }
                }).then((response) => {
                    if (!response)
                        throw new Error('Failed to send code to ' + req.body[type]);
                    return token.output();
                });
            }).then((token) => {
                res.send(token);
            }).catch(next);
        };
    }
    static validateEmailOrMobileChange(type) {
        return (req, res, next) => {
            if (!res.locals.user)
                return next(new Error('Invalid request'));
            if (!res.locals.app)
                return next(new Error('Invalid request'));
            if (!req.body.token || !req.body.code)
                return next(new Error('Invalid request'));
            if (typeof req.body.token !== 'string')
                return next(new Error('Invalid request'));
            if (typeof req.body.code !== 'string')
                return next(new Error('Invalid request'));
            change_email_or_mobile_token_model_1.ChangeEmailOrMobileTokenModel.getOneWithQuery({
                token: req.body.token,
                code: req.body.code,
                type: type,
                appId: res.locals.app._id,
                userId: res.locals.user._id,
            }).then((token) => {
                if (!token)
                    throw new Error('Token not found');
                if (token.used)
                    throw new Error('Token has been used already');
                token.used = true;
                // async save
                token.update(['used']);
                if (type === 'email') {
                    if (!token.newEmail)
                        throw new Error('Invalid token');
                    res.locals.user.email = token.newEmail;
                    res.locals.user.emailValidated = true;
                    return res.locals.user.update(['email', 'emailValidated']);
                }
                else if (type === 'mobile') {
                    if (!token.newMobile)
                        throw new Error('Invalid token');
                    res.locals.user.mobile = token.newMobile;
                    res.locals.user.mobileValidated = true;
                    return res.locals.user.update(['mobile', 'mobileValidated']);
                }
                else {
                    throw new Error('Unkown error');
                }
            }).then((user) => {
                if (!user)
                    throw new Error('Unkown error');
                return user.output();
            }).then((user) => {
                res.send(user);
            }).catch(next);
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=auth.middleware.js.map