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
var AccessTokenModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessTokenModel = void 0;
const user_model_1 = require("./user.model");
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
let debug = require('debug')('app:models:access-tokens');
let AccessTokenModel = AccessTokenModel_1 = class AccessTokenModel extends __1.Model {
    constructor() {
        super();
        this.appId = null;
        this.type = 'access';
        this.token = '';
        this.refresh = '';
        this.code = '';
        this.expires = new Date();
        this.userId = null;
        this.model = AccessTokenModel_1;
    }
    init(type, userId, appId, validity = 2, validityUnit = 'weeks') {
        //super();
        this.type = type;
        this.userId = userId;
        this.appId = appId;
        let len = 32;
        this.token = crypto_1.default.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
        if (this.type === 'access')
            this.refresh = crypto_1.default.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
        if (this.type === 'double-auth')
            this.code = crypto_1.default.randomBytes(Math.ceil(6 / 2)).toString('hex').slice(0, 6);
        this.expires = moment_1.default().add(validity, validityUnit).toDate();
    }
    output() {
        let validity = moment_1.default(this.expires).diff(moment_1.default(), 'seconds');
        return super.output().then((element) => {
            element.validity = validity;
            return element;
        });
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.toDocument,
    __1.validate.required
], AccessTokenModel.prototype, "appId", void 0);
__decorate([
    __1.type.select({ options: ['access', 'double-auth'] }),
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], AccessTokenModel.prototype, "type", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], AccessTokenModel.prototype, "token", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.io.output
], AccessTokenModel.prototype, "refresh", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument
], AccessTokenModel.prototype, "code", void 0);
__decorate([
    __1.type.date({ dateFormat: 'YYYY-MM-DDTHH:mm:ss[Z]' }),
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], AccessTokenModel.prototype, "expires", void 0);
__decorate([
    __1.type.model({ model: user_model_1.UserModel }),
    __1.io.toDocument,
    __1.validate.required
], AccessTokenModel.prototype, "userId", void 0);
AccessTokenModel = AccessTokenModel_1 = __decorate([
    __1.model('accessTokens')
], AccessTokenModel);
exports.AccessTokenModel = AccessTokenModel;
//# sourceMappingURL=access-token.model.js.map