"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileModel = void 0;
const app_model_1 = require("./../app/app.model");
const user_model_1 = require("./user.model");
const __1 = require("../../");
let debug = require('debug')('app:models:profile');
let ProfileModel = class ProfileModel extends __1.Model {
    constructor() {
        super(...arguments);
        this.appId = null;
        this.userId = null;
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.all,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], ProfileModel.prototype, "appId", void 0);
__decorate([
    __1.type.model({ model: user_model_1.UserModel }),
    __1.io.all,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], ProfileModel.prototype, "userId", void 0);
__decorate([
    __1.type.file({ accepted: ['image/*'] }),
    __1.io.all
], ProfileModel.prototype, "picture", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], ProfileModel.prototype, "street", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], ProfileModel.prototype, "zip", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], ProfileModel.prototype, "city", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], ProfileModel.prototype, "country", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], ProfileModel.prototype, "company", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], ProfileModel.prototype, "department", void 0);
ProfileModel = __decorate([
    __1.model('profile'),
    __1.Policies.modelPolicy('getAll', { public: false, userIdByProperty: '_createdBy' }),
    __1.Policies.modelPolicy('getOne', { public: false, userIdByProperty: '_createdBy' }),
    __1.Policies.modelPolicy('put', { public: false, userIdByProperty: '_createdBy' })
], ProfileModel);
exports.ProfileModel = ProfileModel;
//# sourceMappingURL=profile.model.js.map