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
var ValidationTokenModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationTokenModel = void 0;
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
let debug = require('debug')('app:models:validation-tokens');
let ValidationTokenModel = ValidationTokenModel_1 = class ValidationTokenModel extends __1.Model {
    constructor() {
        super();
        this.appId = null;
        this.type = '';
        this.token = '';
        this.emailCode = '';
        this.mobileCode = '';
        this.emailValidated = false;
        this.mobileValidated = false;
        this.expires = new Date();
        this.userCreated = false;
        this.logs = [];
        this.model = ValidationTokenModel_1;
    }
    init(type, validity = 48, validityUnit = 'hours') {
        //super();
        this.type = type;
        let len = 32;
        this.token = crypto_1.default.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
        len = 6;
        this.emailCode = crypto_1.default.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
        this.mobileCode = crypto_1.default.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
        this.expires = moment_1.default().add(validity, validityUnit).toDate();
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.toDocument,
    __1.validate.required
], ValidationTokenModel.prototype, "appId", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.validate.required
], ValidationTokenModel.prototype, "type", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], ValidationTokenModel.prototype, "token", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.validate.required
], ValidationTokenModel.prototype, "emailCode", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.validate.required
], ValidationTokenModel.prototype, "mobileCode", void 0);
__decorate([
    __1.type.boolean,
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], ValidationTokenModel.prototype, "emailValidated", void 0);
__decorate([
    __1.type.boolean,
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], ValidationTokenModel.prototype, "mobileValidated", void 0);
__decorate([
    __1.type.date,
    __1.io.toDocument,
    __1.io.output,
    __1.validate.required
], ValidationTokenModel.prototype, "expires", void 0);
__decorate([
    __1.type.any,
    __1.io.toDocument
], ValidationTokenModel.prototype, "data", void 0);
__decorate([
    __1.type.any,
    __1.io.toDocument
], ValidationTokenModel.prototype, "extraData", void 0);
__decorate([
    __1.type.boolean,
    __1.io.toDocument
], ValidationTokenModel.prototype, "userCreated", void 0);
__decorate([
    __1.type.any,
    __1.io.toDocument
], ValidationTokenModel.prototype, "logs", void 0);
ValidationTokenModel = ValidationTokenModel_1 = __decorate([
    __1.model('validationTokens')
], ValidationTokenModel);
exports.ValidationTokenModel = ValidationTokenModel;
//# sourceMappingURL=validation-token.model.js.map