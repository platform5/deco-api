"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("./../user/user.model");
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
let debug = require('debug')('app:models:dico');
let DataModel = class DataModel extends __1.Model {
    constructor() {
        super(...arguments);
        this.appId = null;
        this.title = '';
        this.value = 0;
        this.type = 'profile';
        this.image = null;
        this.documents = [];
        this.active = false;
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.input,
    __1.io.toDocument,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required
], DataModel.prototype, "appId", void 0);
__decorate([
    __1.type.string,
    __1.validate.required,
    __1.io.all
], DataModel.prototype, "title", void 0);
__decorate([
    __1.type.integer({ min: 0, max: 10 }),
    __1.io.all
], DataModel.prototype, "value", void 0);
__decorate([
    __1.type.float({ min: 0, max: 10 }),
    __1.io.all
], DataModel.prototype, "measure", void 0);
__decorate([
    __1.type.select({ options: ['profile', 'account'] }),
    __1.io.all
], DataModel.prototype, "type", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all
], DataModel.prototype, "tags", void 0);
__decorate([
    __1.type.date({ dateFormat: 'DD.MM.YYYY' }),
    __1.io.all
], DataModel.prototype, "date", void 0);
__decorate([
    __1.type.file({ accepted: ['image/*', 'application/pdf'] }),
    __1.io.all
], DataModel.prototype, "image", void 0);
__decorate([
    __1.type.files({ accepted: ['image/*', 'application/pdf'] }),
    __1.io.all
], DataModel.prototype, "documents", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], DataModel.prototype, "active", void 0);
__decorate([
    __1.type.model({ model: user_model_1.UserModel }),
    __1.io.all
], DataModel.prototype, "user", void 0);
DataModel = __decorate([
    __1.model('data')
], DataModel);
exports.DataModel = DataModel;
//# sourceMappingURL=data.model.js.map