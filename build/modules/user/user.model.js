"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var UserModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
const hmacsha1 = require('crypto-js/hmac-sha1');
// import hmacsha1 from 'crypto-js/hmac-sha1';
let debug = require('debug')('app:models:user');
let UserModel = UserModel_1 = class UserModel extends __1.Model {
    constructor() {
        super(...arguments);
        this.appId = null;
        this.firstname = '';
        this.lastname = '';
        this.email = '';
        this.emailValidated = false;
        this.mobile = '';
        this.mobileValidated = false;
        this.hash = '';
        this.hashUpdateDate = new Date();
        this.requireDoubleAuth = false;
        this.roles = [];
        this.hideOnboarding = false;
    }
    static hashFromPassword(password) {
        return crypto_1.default.createHmac('sha1', __1.Settings.cryptoKey).update(password).digest('hex');
    }
    generateHash(password) {
        this.hash = UserModel_1.hashFromPassword(password);
        this.hashUpdateDate = moment_1.default().toDate();
    }
    toDocument(operation, properties = []) {
        if (this.email)
            this.email = this.email.toLowerCase();
        return super.toDocument(operation, properties);
    }
    static authUser(appId, username, password) {
        let query = new __1.Query({ appId: appId });
        username = username.toLowerCase().trim();
        query.addQuery({ $or: [
                { email: username },
                { mobile: username }
            ] });
        query.addQuery({ hash: UserModel_1.hashFromPassword(password.trim()) });
        return UserModel_1.getOneWithQuery(query.onlyQuery()).then((user) => {
            if (!user)
                return false;
            return user;
        });
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.all,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], UserModel.prototype, "appId", void 0);
__decorate([
    __1.type.string,
    __1.io.all,
    __1.validate.required,
    __1.query.searchable,
    __1.query.all
], UserModel.prototype, "firstname", void 0);
__decorate([
    __1.type.string,
    __1.io.all,
    __1.validate.required,
    __1.query.searchable,
    __1.query.all
], UserModel.prototype, "lastname", void 0);
__decorate([
    __1.type.string,
    __1.io.all,
    __1.validate.email,
    __1.query.searchable,
    __1.query.all,
    __1.validate.uniqueByApp,
    __1.mongo.index({ type: 'single' })
], UserModel.prototype, "email", void 0);
__decorate([
    __1.type.boolean,
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], UserModel.prototype, "emailValidated", void 0);
__decorate([
    __1.type.string,
    __1.io.all,
    __1.query.all,
    __1.query.searchable,
    __1.validate.uniqueByApp,
    __1.mongo.index({ type: 'single' })
], UserModel.prototype, "mobile", void 0);
__decorate([
    __1.type.boolean,
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], UserModel.prototype, "mobileValidated", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.validate.required,
    __1.query.all,
    __1.mongo.index({ type: 'single' })
], UserModel.prototype, "hash", void 0);
__decorate([
    __1.type.date,
    __1.io.toDocument,
    __1.validate.required
], UserModel.prototype, "hashUpdateDate", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], UserModel.prototype, "requireDoubleAuth", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], UserModel.prototype, "locale", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.input,
    __1.io.output,
    __1.io.toDocument
], UserModel.prototype, "roles", void 0);
__decorate([
    __1.type.boolean,
    __1.io.output,
    __1.io.toDocument
], UserModel.prototype, "hideOnboarding", void 0);
UserModel = UserModel_1 = __decorate([
    __1.Policies.modelPolicy('getAll', { public: false, userIdByProperty: '_createdBy' }),
    __1.Policies.modelPolicy('getOne', { public: false, userIdByProperty: '_createdBy' }),
    __1.Policies.modelPolicy('put', { public: false, userIdByProperty: '_createdBy' }),
    __1.model('users')
], UserModel);
exports.UserModel = UserModel;
// the following lines fixes the AppModel config of the appId property of the UserModel.
// this is necessary because there is a circular reference between AppModel and UserModel
// and the decorating concept fails to link the two correctly
setTimeout(() => {
    UserModel.deco.propertyTypesOptions.appId.model = app_model_1.AppModel;
}, 1000);
//# sourceMappingURL=user.model.js.map