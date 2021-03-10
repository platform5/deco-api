"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicConfigModel = void 0;
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
let debug = require('debug')('app:models:dynamicconfig');
let DynamicConfigModel = class DynamicConfigModel extends __1.Model {
    constructor() {
        super(...arguments);
        this.appId = null;
        this.relatedToAppId = null;
        this.name = '';
        this.slug = '';
        this.isPublic = false;
        this.readingAccess = 'all';
        this.readingRoles = [];
        this.writingAccess = 'all';
        this.writingRoles = [];
        this.fields = [];
        this.enableAdminNotification = false;
        this.enableUserNotification = false;
        this.notificationType = 'email';
        this.notifyWhen = 'create';
        this.policy = {};
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.all,
    __1.validate.required,
    __1.query.filterable({ type: 'auto' }),
    __1.mongo.index({ type: 'single' })
], DynamicConfigModel.prototype, "appId", void 0);
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.all,
    __1.validate.required,
    __1.query.filterable({ type: 'auto' }),
    __1.mongo.index({ type: 'single' })
], DynamicConfigModel.prototype, "relatedToAppId", void 0);
__decorate([
    __1.type.string,
    __1.io.all,
    __1.validate.required,
    __1.query.sortable
], DynamicConfigModel.prototype, "name", void 0);
__decorate([
    __1.type.string,
    __1.io.all,
    __1.validate.slug,
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], DynamicConfigModel.prototype, "slug", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], DynamicConfigModel.prototype, "isPublic", void 0);
__decorate([
    __1.type.select({ options: ['all', 'creator', 'users', 'usersWithRoles'] }),
    __1.io.all
], DynamicConfigModel.prototype, "readingAccess", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all
], DynamicConfigModel.prototype, "readingRoles", void 0);
__decorate([
    __1.type.select({ options: ['all', 'creator', 'users', 'usersWithRoles'] }),
    __1.io.all
], DynamicConfigModel.prototype, "writingAccess", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all
], DynamicConfigModel.prototype, "writingRoles", void 0);
__decorate([
    __1.type.array({ type: 'object', options: {
            keys: {
                name: { type: 'string' },
                options: { type: 'any' },
                required: { type: 'boolean' },
                type: { type: 'string' },
                validation: { type: 'array', options: { type: 'ane' } },
                filterable: { type: 'string' },
                searchable: { type: 'boolean' },
                sortable: { type: 'boolean' },
            }
        } }),
    __1.io.all
], DynamicConfigModel.prototype, "fields", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], DynamicConfigModel.prototype, "label", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], DynamicConfigModel.prototype, "enableAdminNotification", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], DynamicConfigModel.prototype, "enableUserNotification", void 0);
__decorate([
    __1.type.select({ options: ['email'], multiple: true }),
    __1.io.all
], DynamicConfigModel.prototype, "notificationType", void 0);
__decorate([
    __1.type.select({ options: ['create', 'edit', 'delete'], multiple: true }),
    __1.io.all
], DynamicConfigModel.prototype, "notifyWhen", void 0);
__decorate([
    __1.type.string
    //@validate.email // because it can also be notify:userId
    ,
    __1.io.all
], DynamicConfigModel.prototype, "notificationAdminEmail", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], DynamicConfigModel.prototype, "notificationAdminSubject", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], DynamicConfigModel.prototype, "notificationAdminContentPrefix", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], DynamicConfigModel.prototype, "notificationAdminContentSuffix", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], DynamicConfigModel.prototype, "notificationAdminTemplate", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], DynamicConfigModel.prototype, "notificationUserField", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], DynamicConfigModel.prototype, "notificationUserSubject", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], DynamicConfigModel.prototype, "notificationUserContentPrefix", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], DynamicConfigModel.prototype, "notificationUserContentSuffix", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], DynamicConfigModel.prototype, "notificationUserTemplate", void 0);
__decorate([
    __1.type.object({ keys: {
            globalModelPolicy: { type: 'any' },
            readModelPolicy: { type: 'any' },
            writeModelPolicy: { type: 'any' },
            getAllPolicy: { type: 'any' },
            getOnePolicy: { type: 'any' },
            postPolicy: { type: 'any' },
            putPolicy: { type: 'any' },
            deletePolicy: { type: 'any' },
            globalIOPolicy: { type: 'any' },
            inputPolicy: { type: 'any' },
            outputPolicy: { type: 'any' }
        } }),
    __1.io.all
], DynamicConfigModel.prototype, "policy", void 0);
DynamicConfigModel = __decorate([
    __1.model('dynamicconfig')
], DynamicConfigModel);
exports.DynamicConfigModel = DynamicConfigModel;
//# sourceMappingURL=dynamicconfig.model.js.map