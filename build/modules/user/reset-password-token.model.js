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
var ResetPasswordTokenModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("./user.model");
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
let debug = require('debug')('app:models:reset-password-token');
let ResetPasswordTokenModel = ResetPasswordTokenModel_1 = class ResetPasswordTokenModel extends __1.Model {
    constructor() {
        super();
        this.appId = null;
        this.token = '';
        this.code = '';
        this.expires = new Date();
        this.userId = null;
        this.model = ResetPasswordTokenModel_1;
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
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.toDocument,
    __1.validate.required
], ResetPasswordTokenModel.prototype, "appId", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], ResetPasswordTokenModel.prototype, "token", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument
], ResetPasswordTokenModel.prototype, "code", void 0);
__decorate([
    __1.type.date({ dateFormat: 'YYYY-MM-DDTHH:mm:ss[Z]' }),
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], ResetPasswordTokenModel.prototype, "expires", void 0);
__decorate([
    __1.type.model({ model: user_model_1.UserModel }),
    __1.io.toDocument,
    __1.validate.required
], ResetPasswordTokenModel.prototype, "userId", void 0);
ResetPasswordTokenModel = ResetPasswordTokenModel_1 = __decorate([
    __1.model('resetPasswordTokens')
], ResetPasswordTokenModel);
exports.ResetPasswordTokenModel = ResetPasswordTokenModel;
//# sourceMappingURL=reset-password-token.model.js.map