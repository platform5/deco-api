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
var ChangeEmailOrMobileTokenModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeEmailOrMobileTokenModel = void 0;
const user_model_1 = require("./user.model");
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
let debug = require('debug')('app:models:reset-password-token');
let ChangeEmailOrMobileTokenModel = ChangeEmailOrMobileTokenModel_1 = class ChangeEmailOrMobileTokenModel extends __1.Model {
    constructor() {
        super();
        this.appId = null;
        this.token = '';
        this.code = '';
        this.expires = new Date();
        this.userId = null;
        this.used = false;
        this.model = ChangeEmailOrMobileTokenModel_1;
    }
    init(userId, appId, validity = 1, validityUnit = 'hours') {
        //super();
        this.userId = userId;
        this.appId = appId;
        let len = 32;
        this.token = crypto_1.default.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
        len = 6;
        this.code = crypto_1.default.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
        this.expires = moment_1.default().add(validity, validityUnit).toDate();
    }
    set(type, value) {
        this.type = type;
        if (this.type === 'email') {
            this.newEmail = value;
        }
        else if (this.type === 'mobile') {
            this.newMobile = value;
        }
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.toDocument,
    __1.validate.required
], ChangeEmailOrMobileTokenModel.prototype, "appId", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], ChangeEmailOrMobileTokenModel.prototype, "token", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument
], ChangeEmailOrMobileTokenModel.prototype, "code", void 0);
__decorate([
    __1.type.date({ dateFormat: 'YYYY-MM-DDTHH:mm:ss[Z]' }),
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], ChangeEmailOrMobileTokenModel.prototype, "expires", void 0);
__decorate([
    __1.type.model({ model: user_model_1.UserModel }),
    __1.io.toDocument,
    __1.validate.required
], ChangeEmailOrMobileTokenModel.prototype, "userId", void 0);
__decorate([
    __1.type.select({ options: ['email', 'mobile'] }),
    __1.io.toDocument,
    __1.validate.required
], ChangeEmailOrMobileTokenModel.prototype, "type", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.validate.email
], ChangeEmailOrMobileTokenModel.prototype, "newEmail", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument
], ChangeEmailOrMobileTokenModel.prototype, "newMobile", void 0);
__decorate([
    __1.type.boolean,
    __1.io.toDocument
], ChangeEmailOrMobileTokenModel.prototype, "used", void 0);
ChangeEmailOrMobileTokenModel = ChangeEmailOrMobileTokenModel_1 = __decorate([
    __1.model('changeemailormobiletoken')
], ChangeEmailOrMobileTokenModel);
exports.ChangeEmailOrMobileTokenModel = ChangeEmailOrMobileTokenModel;
//# sourceMappingURL=change-email-or-mobile-token.model.js.map