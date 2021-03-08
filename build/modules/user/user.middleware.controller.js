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
const validation_token_model_1 = require("./validation-token.model");
const app_model_1 = require("./../app/app.model");
const user_model_1 = require("./user.model");
const controller_1 = require("./../../middlewares/controller");
const __1 = require("../../");
const __2 = require("../../");
const moment_1 = __importDefault(require("moment"));
const helpers_1 = require("../../helpers");
let debug = require('debug')('app:middleware:user');
class UserControllerMiddleware extends controller_1.ControllerMiddleware {
    constructor() {
        super(...arguments);
        this.ignoreEmailsForTestAccounts = false;
    }
    validateAndPost() {
        return (req, res, next) => {
            if (req.body.token && req.body.emailCode && req.body.mobileCode) {
                this.validateTokenAndInsert('both', req, res, next);
            }
            else if (req.body.token && req.body.emailCode) {
                this.validateTokenAndInsert('email', req, res, next);
            }
            else if (req.body.token && req.body.mobileCode) {
                this.validateTokenAndInsert('mobile', req, res, next);
            }
            else {
                this.createUserAndToken(req, res, next);
            }
        };
    }
    resendCode(req, res, next) {
        if (!res.locals.app.openUserRegistration)
            return next(new Error('User registration not allowed for this app'));
        if (!req.body.token)
            return next(new Error('Missing token'));
        if (!req.body.method)
            return next(new Error('Missing method'));
        if (req.body.method !== 'email' && req.body.method !== 'mobile')
            return next(new Error('Invalid method'));
        let now = moment_1.default().toDate();
        let query = { token: req.body.token, expires: { $gte: now }, userCreated: false };
        validation_token_model_1.ValidationTokenModel.getOneWithQuery(query).then((token) => {
            if (!token)
                throw new Error('Token not found');
            if (!token.data)
                throw new Error('Invalid token');
            if (req.body.method === 'email' && token.emailValidated)
                throw new Error('Email is already validated for this token');
            if (req.body.method === 'mobile' && token.mobileValidated)
                throw new Error('Mobile is already validated for this token');
            if (req.body.method === 'email') {
                let emailServiceForApp = __2.NotificationEmailService.serviceForApp(res.locals.app);
                return emailServiceForApp.send(token.data.email, 'validate-email', {
                    app: res.locals.app,
                    locale: req.body.locale,
                    user: token.data,
                    token: token,
                    device: {
                        ip: req.ip,
                        userAgent: req.headers['user-agent']
                    }
                }).then((response) => {
                    if (!response) {
                        if (!Array.isArray(token.logs))
                            token.logs = [];
                        token.logs.push({
                            action: 'resendCode',
                            error: 'Failed to send validation email',
                            data: response
                        });
                        token.update(['logs']);
                        throw new Error('Failed to send validation email');
                    }
                    return token;
                });
            }
            else if (req.body.method === 'mobile') {
                return __2.smsService.send(token.data.mobile, 'validate-email', {
                    app: res.locals.app,
                    locale: req.body.locale,
                    user: token.data,
                    token: token,
                    device: {
                        ip: req.ip,
                        userAgent: req.headers['user-agent']
                    }
                }).then((response) => {
                    if (!Array.isArray(token.logs))
                        token.logs = [];
                    token.logs.push({
                        action: 'resendCode',
                        error: 'Failed to send validation SMS',
                        data: response
                    });
                    token.update(['logs']);
                    if (!response)
                        throw new Error('Failed to send validation SMS');
                    return token;
                });
            }
            else {
                throw new Error('Unkown error');
            }
        }).then((token) => {
            token.expires = moment_1.default().add(24, 'hours').toDate();
            return token.update(['expires']);
        }).then((token) => {
            return token.output();
        }).then((element) => {
            res.locals.element = element;
            res.send(element);
        }).catch(next);
    }
    createUserAndToken(req, res, next) {
        if (!res.locals.app.openUserRegistration)
            return next(new Error('User registration not allowed for this app'));
        if (!req.body || !req.body.password)
            return next(new Error('Missing password'));
        return this.model.instanceFromRequest(req, res).then((element) => {
            // here we have a valid user ready to be created
            // we save it inside a token a request validation
            element.generateHash(req.body.password);
            return element.toDocument('insert').then(updateQuery => updateQuery.getInsertDocument());
        }).then((element) => {
            let token = new validation_token_model_1.ValidationTokenModel();
            token.init('create-user');
            token.appId = element.appId;
            token.data = element;
            token.extraData = req.body.extraData ? req.body.extraData : undefined;
            // we do not check for appId in the case of email
            // because we only accept @decoapi.ch emails
            // and it allow us to use this test door for any application in our system
            if (element.email && element.email.match(/^test([0-9]{0,4})@decoapi\.com$/)) {
                token.emailCode = element.email + 'a1b2c3'; // use for test with emails such as test01@decoapi.com or test843@decoapi.com
            }
            if (element.mobile && element.mobile.match(/^\+4170([0-9]{7})$/)) {
                token.mobileCode = element.mobile + 'a1b2c3'; // use for test for mobiles such as +41702567760
            }
            return token.insert();
        }).then((tokenElement) => {
            // send email for validation and return token
            let app = res.locals.app;
            if (app.createAccountValidation === 'mobileOnly' || app.createAccountValidation === 'none' || !req.body.email) {
                return Promise.resolve(tokenElement);
            }
            let emailServiceForApp = __2.NotificationEmailService.serviceForApp(res.locals.app);
            if (this.ignoreEmailsForTestAccounts && tokenElement.emailCode === `${tokenElement.data.email}a1b2c3`)
                return Promise.resolve(tokenElement);
            return emailServiceForApp.send(tokenElement.data.email, 'validate-email', {
                app: res.locals.app,
                locale: req.body.locale,
                user: tokenElement.data,
                token: tokenElement,
                device: {
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                }
            }).then((response) => {
                if (!response) {
                    if (!Array.isArray(tokenElement.logs))
                        tokenElement.logs = [];
                    tokenElement.logs.push({
                        action: 'createUserAndToken',
                        error: 'Failed to send validation email',
                        data: response
                    });
                    tokenElement.update(['logs']);
                    throw new Error('Failed to send validation email');
                }
                return tokenElement;
            });
        }).then((tokenElement) => {
            // send SMS for validation and return token
            let app = res.locals.app;
            if (app.createAccountValidation === 'emailOnly' || app.createAccountValidation === 'none' || !req.body.mobile) {
                return Promise.resolve(tokenElement);
            }
            if (tokenElement.mobileCode === `${tokenElement.data.mobile}a1b2c3`)
                return Promise.resolve(tokenElement);
            return __2.smsService.send(tokenElement.data.mobile, 'validate-email', {
                app: res.locals.app,
                locale: req.body.locale,
                user: tokenElement.data,
                token: tokenElement,
                device: {
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                }
            }).then((response) => {
                if (!response) {
                    if (!Array.isArray(tokenElement.logs))
                        tokenElement.logs = [];
                    tokenElement.logs.push({
                        action: 'createUserAndToken',
                        error: 'Failed to send validation SMS',
                        data: response
                    });
                    tokenElement.update(['logs']);
                    throw new Error('Failed to send validation SMS');
                }
                return tokenElement;
            });
        }).then((tokenElement) => {
            return tokenElement.output();
        }).then((tokenElement) => {
            if (res.locals.app.createAccountValidation === 'none') {
                user_model_1.UserModel.instanceFromDocument(tokenElement.data).then(user => user.insert()).then(user => user.output()).then(user => res.send(user)).catch(next);
            }
            else {
                tokenElement.createAccountValidation = res.locals.app.createAccountValidation;
                res.send(tokenElement);
            }
        }).catch(next);
    }
    validateTokenAndInsert(method, req, res, next) {
        let now = moment_1.default().toDate();
        let query = { token: req.body.token, expires: { $gte: now } };
        if (method === 'email' || method === 'both')
            query.emailCode = req.body.emailCode;
        if (method === 'mobile' || method === 'both')
            query.mobileCode = req.body.mobileCode;
        let validated = false;
        let extraData;
        let user;
        return validation_token_model_1.ValidationTokenModel.getOneWithQuery(query).then((token) => {
            if (!token)
                throw new Error('Token not found or invalid');
            // flag the token as validated for the current method
            let t = token;
            if (method === 'email' || method === 'both')
                t.emailValidated = true;
            if (method === 'mobile' || method === 'both')
                t.mobileValidated = true;
            // flag the user as validated for the current method
            if (t.emailValidated)
                t.data.emailValidated = true;
            if (t.mobileValidated)
                t.data.mobileValidated = true;
            return token.update();
        }).then((token) => {
            let app = res.locals.app;
            let t = token;
            if (app.createAccountValidation === 'none') {
                validated = true;
            }
            else if (app.createAccountValidation === 'emailOnly' && t.emailValidated) {
                validated = true;
            }
            else if (app.createAccountValidation === 'mobileOnly' && t.mobileValidated) {
                validated = true;
            }
            else if (app.createAccountValidation === 'emailOrMobile' && (t.mobileValidated || t.emailValidated)) {
                validated = true;
            }
            else if (app.createAccountValidation === 'emailAndMobile' && (t.mobileValidated && t.emailValidated)) {
                validated = true;
            }
            // if not validated, we simply return the token
            if (!validated)
                return t.output();
            // if validated, if the user has not yet been created, we create it and indicate in the token that the user is created
            if (!t.userCreated) {
                t.userCreated = true;
                extraData = t.extraData;
                return t.update().then(() => {
                    return user_model_1.UserModel.instanceFromDocument(t.data).then(user => user.insert()).then((u) => {
                        user = u;
                        return user.output();
                    });
                });
            }
            else {
                // if the user is already created, we must update the validate flags
                return user_model_1.UserModel.getOneWithQuery({ appId: app._id, mobile: t.data.mobile, email: t.data.email }).then((u) => {
                    if (!u)
                        throw new Error('Invalid request');
                    user = u;
                    u.emailValidated = t.emailValidated;
                    u.mobileValidated = t.mobileValidated;
                    return u.update(['emailValidated', 'mobileValidated']);
                }).then(user => user.output());
            }
        }).then((element) => __awaiter(this, void 0, void 0, function* () {
            // if the element is a token, we want to add the app.createAccountValidation to it
            if (element.token) {
                element.createAccountValidation = res.locals.app.createAccountValidation;
            }
            helpers_1.appEvents.emit('user:created', user, extraData);
            // if the token is validated, return the user
            // otherwise return the token again
            res.send(element);
        })).catch(next);
    }
    getCurrentUser() {
        return (req, res, next) => {
            if (!res.locals.user)
                return next(new Error('User not found'));
            if (res.locals.user instanceof user_model_1.UserModel !== true)
                return next(new Error('Invalid user'));
            res.locals.user.output().then((user) => {
                res.send(user);
            });
        };
    }
    getOneElement(element, req, res) {
        if (req.params && req.params.appId) {
            if (element.appId !== null && element.appId.toString() !== req.params.appId)
                throw new Error('Access Denied');
        }
        else if (res.locals.app) {
            if (element.appId !== null && element.appId.toString() !== res.locals.app._id.toString())
                throw new Error('Access Denied');
        }
        return Promise.resolve(element);
    }
    putElement(element, req, res) {
        if (req.params && req.params.appId) {
            if (element.appId !== null && element.appId.toString() !== req.params.appId)
                throw new Error('Access Denied');
        }
        else if (res.locals.app) {
            if (element.appId !== null && element.appId.toString() !== res.locals.app._id.toString())
                throw new Error('Access Denied');
        }
        return Promise.resolve(element);
    }
    deleteElement(element, req, res) {
        if (req.params && req.params.appId) {
            if (element.appId !== null && element.appId.toString() !== req.params.appId)
                throw new Error('Access Denied');
        }
        else if (res.locals.app) {
            if (element.appId !== null && element.appId.toString() !== res.locals.app._id.toString())
                throw new Error('Access Denied');
        }
        return Promise.resolve(element);
    }
    outputSearch(req, res, next) {
        let elements = res.locals.elements;
        let results = [];
        for (let index in elements) {
            let element = elements[index];
            results.push({
                id: element.id,
                firstname: element.firstname,
                lastname: element.lastname,
                picture: (element.profile && element.profile.picture) ? element.profile.picture : null,
                profileId: (element.profile && element.profile.id) ? element.profile.id : null
            });
        }
        res.send(results);
    }
    onlyUsersInvitedInParamApp(req, res, next) {
        let query = (res.locals.query) ? res.locals.query : new __1.Query();
        let rightInstance = query instanceof __1.Query;
        if (!rightInstance)
            return next(new Error('res.locals.query is not a valid Query object'));
        if (!res.locals.paramApp)
            return next(new Error('Missing paramApp'));
        rightInstance = res.locals.paramApp instanceof app_model_1.AppModel;
        if (!rightInstance)
            return next(new Error('res.locals.paramApp is not a valid AppModel object'));
        let paramApp = res.locals.paramApp;
        let userIds = paramApp.users.map(i => i._id);
        res.locals.query.addQuery({ _id: { $in: userIds } });
        next();
    }
    outputParamAppRoles(req, res, next) {
        let query = (res.locals.query) ? res.locals.query : new __1.Query();
        if (!res.locals.paramApp)
            return next(new Error('Missing paramApp'));
        let rightInstance = res.locals.paramApp instanceof app_model_1.AppModel;
        if (!rightInstance)
            return next(new Error('res.locals.paramApp is not a valid AppModel object'));
        if (!res.locals.elements)
            return next(new Error('Missing elements'));
        let rolesByUserId = {};
        let paramApp = res.locals.paramApp;
        for (let user of paramApp.users) {
            rolesByUserId[user._id.toString()] = user.roles;
        }
        for (let element of res.locals.elements) {
            element.roles = rolesByUserId[element.id];
        }
        res.send(res.locals.elements);
    }
    hideOnboarding(req, res, next) {
        if (!res.locals.user)
            return next(new Error('Missing user'));
        let rightInstance = res.locals.user instanceof user_model_1.UserModel;
        if (!rightInstance)
            return next(new Error('Invalid user'));
        let user = res.locals.user;
        user.hideOnboarding = true;
        user.update(['hideOnboarding']).then((user) => {
            return user.output();
        }).then((user) => {
            res.send(user);
        }).catch(next);
    }
}
exports.UserControllerMiddleware = UserControllerMiddleware;
//# sourceMappingURL=user.middleware.controller.js.map