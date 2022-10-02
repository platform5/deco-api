"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicDataModel2 = void 0;
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
const dynamicconfig_model_1 = require("./dynamicconfig.model");
let debug = require('debug')('app:models:dynamic');
let DynamicDataModel2 = class DynamicDataModel2 extends __1.Model {
    constructor() {
        super(...arguments);
        this.appId = null;
        this.modelId = null;
    }
    static decoFromRequest(req, res) {
        return res.locals.dynamicDeco;
    }
    decoFromRequest(req, res) {
        return res.locals.dynamicDeco;
    }
};
__decorate([
    __1.type.id
], DynamicDataModel2.prototype, "_id", void 0);
__decorate([
    __1.type.date
], DynamicDataModel2.prototype, "_createdAt", void 0);
__decorate([
    __1.type.date
], DynamicDataModel2.prototype, "_updatedAt", void 0);
__decorate([
    __1.type.id
], DynamicDataModel2.prototype, "_createdBy", void 0);
__decorate([
    __1.type.id
], DynamicDataModel2.prototype, "_updatedBy", void 0);
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.all,
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], DynamicDataModel2.prototype, "appId", void 0);
__decorate([
    __1.type.model({ model: dynamicconfig_model_1.DynamicConfigModel }),
    __1.io.all,
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], DynamicDataModel2.prototype, "modelId", void 0);
DynamicDataModel2 = __decorate([
    __1.model('dyn')
], DynamicDataModel2);
exports.DynamicDataModel2 = DynamicDataModel2;
//# sourceMappingURL=dynamicdata2.model.js.map