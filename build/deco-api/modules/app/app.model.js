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
var AppModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModel = void 0;
const __1 = require("../../");
const crypto_1 = __importDefault(require("crypto"));
let debug = require('debug')('app:models:app');
;
let AppModel = AppModel_1 = class AppModel extends __1.Model {
    constructor() {
        super(...arguments);
        this.appId = null;
        this.name = '';
        this.description = '';
        this.image = null;
        this.primaryColor = '';
        this.primaryForegroundColor = '';
        this.primaryLightColor = '';
        this.primaryLightForegroundColor = '';
        this.primaryDarkColor = '';
        this.primaryDarkForegroundColor = '';
        this.accentColor = '';
        this.accentForegroundColor = '';
        this.accentLightColor = '';
        this.accentLightForegroundColor = '';
        this.accentDarkColor = '';
        this.accentDarkForegroundColor = '';
        this.publicKeys = [];
        this.privateKeys = [];
        this.openUserRegistration = true;
        this.createAccountValidation = 'emailOrMobile';
        this.createAccountRoles = [];
        this.requireDoubleAuth = false;
        this.doubleAuthMethod = 'auto';
        this.enableShop = false;
        this.enableMultipleShops = false;
        this.availableRoles = ['admin', 'user', 'shop'];
        this.adminUserRoles = ['admin', 'user'];
        this.adminShopRoles = ['admin', 'shop'];
        this.enableThree = false;
        this.adminThreeRoles = ['admin', 'three'];
        this.users = [];
        this.locales = ['fr', 'en'];
        this.defaultLocale = 'fr';
        this.smtpConfigHost = '';
        this.smtpConfigPort = 587;
        this.smtpConfigUser = '';
        this.smtpConfigPassword = '';
        this.smtpConfigSecure = false;
        this.smtpConfigFromName = '';
        this.smtpConfigFromEmail = '';
        this.pushEnabled = false;
        this.pushGmId = '';
        this.pushApnCert = '';
        this.pushApnKey = '';
        this.pushApnPass = '';
        this.pushApnProduction = false;
        this.pushTopic = '';
    }
    output() {
        return super.output().then((element) => {
            let publicKeys = [];
            for (let index in this.publicKeys) {
                let key = this.publicKeys[index];
                if (!key.key) {
                    continue;
                }
                publicKeys.push({ name: key.name, expires: key.expires, active: key.active, last4: key.key.substr(-4) });
            }
            element.publicKeys = publicKeys;
            let privateKeys = [];
            for (let index in this.privateKeys) {
                let key = this.privateKeys[index];
                if (!key.key) {
                    continue;
                }
                privateKeys.push({ name: key.name, expires: key.expires, active: key.active, last4: key.key.substr(-4) });
            }
            element.privateKeys = privateKeys;
            return element;
        });
    }
    toDocument(operation) {
        return super.toDocument(operation).then((data) => {
            let document = data.getInsertDocument();
            if (!document.roles || !Array.isArray(document.roles))
                document.roles = ['admin'];
            if (document.roles.indexOf('admin') === -1)
                document.roles.push('admin');
            data.set('roles', document.roles);
            return data;
        });
    }
    static generateKey() {
        let len = 12;
        return crypto_1.default.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
    }
};
__decorate([
    __1.type.model({ model: AppModel_1 }),
    __1.io.input,
    __1.io.toDocument,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], AppModel.prototype, "appId", void 0);
__decorate([
    __1.type.string,
    __1.io.all,
    __1.validate.required
], AppModel.prototype, "name", void 0);
__decorate([
    __1.type.string({ textarea: true }),
    __1.io.all
], AppModel.prototype, "description", void 0);
__decorate([
    __1.type.file({ accepted: ['image/*', 'application/pdf'] }),
    __1.io.all
], AppModel.prototype, "image", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "primaryColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "primaryForegroundColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "primaryLightColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "primaryLightForegroundColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "primaryDarkColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "primaryDarkForegroundColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "accentColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "accentForegroundColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "accentLightColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "accentLightForegroundColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "accentDarkColor", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "accentDarkForegroundColor", void 0);
__decorate([
    __1.io.toDocument,
    __1.type.array({ type: 'object', objectOptions: {
            keys: {
                key: { type: 'string', required: true },
                name: { type: 'string', required: true },
                expires: { type: 'date', dateFormat: 'DD-MM-YYYY' },
                active: { type: 'boolean' }
            }
        } })
], AppModel.prototype, "publicKeys", void 0);
__decorate([
    __1.io.toDocument,
    __1.type.array({ type: 'object', objectOptions: {
            keys: {
                key: { type: 'string', required: true },
                name: { type: 'string', required: true },
                expires: { type: 'date', dateFormat: 'DD-MM-YYYY' },
                active: { type: 'boolean' }
            }
        } })
], AppModel.prototype, "privateKeys", void 0);
__decorate([
    __1.type.boolean,
    __1.validate.required,
    __1.io.all
], AppModel.prototype, "openUserRegistration", void 0);
__decorate([
    __1.type.select({ options: ['emailOrMobile', 'emailAndMobile', 'emailOnly', 'mobileOnly', 'none'] }),
    __1.validate.required,
    __1.io.all
], AppModel.prototype, "createAccountValidation", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all
], AppModel.prototype, "createAccountRoles", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], AppModel.prototype, "requireDoubleAuth", void 0);
__decorate([
    __1.type.select({ options: ['auto', 'email', 'sms'] }),
    __1.io.all
], AppModel.prototype, "doubleAuthMethod", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], AppModel.prototype, "enableShop", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], AppModel.prototype, "enableMultipleShops", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all
], AppModel.prototype, "availableRoles", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all
], AppModel.prototype, "adminUserRoles", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all
], AppModel.prototype, "adminShopRoles", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], AppModel.prototype, "enableThree", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all
], AppModel.prototype, "adminThreeRoles", void 0);
__decorate([
    __1.type.array({ type: 'object', options: {
            keys: {
                _id: { type: 'model', options: { model: __1.UserModel } },
                roles: { type: 'array', options: { type: 'string' } }
            }
        } }),
    __1.io.output,
    __1.io.toDocument
], AppModel.prototype, "users", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all
], AppModel.prototype, "locales", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "defaultLocale", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "smtpConfigHost", void 0);
__decorate([
    __1.type.integer,
    __1.io.all
], AppModel.prototype, "smtpConfigPort", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "smtpConfigUser", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "smtpConfigPassword", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], AppModel.prototype, "smtpConfigSecure", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "smtpConfigFromName", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "smtpConfigFromEmail", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], AppModel.prototype, "pushEnabled", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "pushGmId", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "pushApnCert", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "pushApnKey", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "pushApnPass", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], AppModel.prototype, "pushApnProduction", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], AppModel.prototype, "pushTopic", void 0);
AppModel = AppModel_1 = __decorate([
    __1.model('apps')
], AppModel);
exports.AppModel = AppModel;
// the following lines fixes the AppModel config of the appId property of the UserModel.
// this is necessary because there is a circular reference between AppModel and UserModel
// and the decorating concept fails to link the two correctly
setTimeout(() => {
    AppModel.deco.propertyTypesOptions.users.options.keys._id.options.model = __1.UserModel;
}, 2000);
//# sourceMappingURL=app.model.js.map