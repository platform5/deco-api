"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
let debug = require('debug')('app:models:dico');
let TemplateModel = class TemplateModel extends __1.Model {
    constructor() {
        super(...arguments);
        this.appId = null;
        this.key = '';
        this.subject = '';
        this.html = '';
        this.text = '';
        this.sms = '';
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.input,
    __1.io.toDocument,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], TemplateModel.prototype, "appId", void 0);
__decorate([
    __1.type.string,
    __1.io.all,
    __1.validate.required,
    __1.validate.uniqueByApp,
    __1.mongo.index({ type: 'single' })
], TemplateModel.prototype, "key", void 0);
__decorate([
    __1.type.string({ multilang: true, locales: [] }),
    __1.io.all,
    __1.validate.required
], TemplateModel.prototype, "subject", void 0);
__decorate([
    __1.type.string({ multilang: true, locales: [] }),
    __1.io.all,
    __1.validate.required
], TemplateModel.prototype, "html", void 0);
__decorate([
    __1.type.string({ multilang: true, locales: [] }),
    __1.io.all
], TemplateModel.prototype, "text", void 0);
__decorate([
    __1.type.string({ multilang: true, locales: [] }),
    __1.io.all
], TemplateModel.prototype, "sms", void 0);
TemplateModel = __decorate([
    __1.model('template')
], TemplateModel);
exports.TemplateModel = TemplateModel;
//# sourceMappingURL=template.model.js.map