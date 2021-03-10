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
let DicoModel = class DicoModel extends __1.Model {
    constructor() {
        super(...arguments);
        this.appId = null;
        this.key = '';
        this.value = '';
        this.tags = [];
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.input,
    __1.io.toDocument,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], DicoModel.prototype, "appId", void 0);
__decorate([
    __1.type.string,
    __1.io.all,
    __1.validate.required,
    __1.query.searchable,
    __1.query.filterable({ type: 'auto' }),
    __1.query.sortable,
    __1.mongo.index({ type: 'single' })
], DicoModel.prototype, "key", void 0);
__decorate([
    __1.type.string({ multilang: true, locales: [] }),
    __1.io.all,
    __1.query.searchable,
    __1.validate.required
], DicoModel.prototype, "value", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all,
    __1.query.searchable,
    __1.query.filterable({ type: 'auto' })
], DicoModel.prototype, "tags", void 0);
DicoModel = __decorate([
    __1.model('dico')
], DicoModel);
exports.DicoModel = DicoModel;
//# sourceMappingURL=dico.model.js.map