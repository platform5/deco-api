"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationModel = void 0;
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
let debug = require('debug')('app:models:dico');
let PushNotificationModel = class PushNotificationModel extends __1.Model {
    constructor() {
        super(...arguments);
        this.sentToRegIds = [];
        this.viewedByRegIds = [];
        this.openedByRegIds = [];
        this.sendToTags = [];
        this.sent = false;
    }
    output(includeProps) {
        let nbSent = this.sentToRegIds.length || 0;
        let nbViewed = this.viewedByRegIds.length || 0;
        let nbOpened = this.openedByRegIds.length || 0;
        return super.output(includeProps).then((data) => {
            data.nbSent = nbSent;
            data.nbViewed = nbViewed;
            data.nbOpened = nbOpened;
            return data;
        });
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.all,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], PushNotificationModel.prototype, "appId", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.toDocument
], PushNotificationModel.prototype, "sentToRegIds", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.toDocument
], PushNotificationModel.prototype, "viewedByRegIds", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.toDocument
], PushNotificationModel.prototype, "openedByRegIds", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], PushNotificationModel.prototype, "title", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], PushNotificationModel.prototype, "message", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], PushNotificationModel.prototype, "collapseKey", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], PushNotificationModel.prototype, "contentAvailable", void 0);
__decorate([
    __1.type.integer,
    __1.io.all
], PushNotificationModel.prototype, "badge", void 0);
__decorate([
    __1.type.string,
    __1.io.all
], PushNotificationModel.prototype, "custom", void 0);
__decorate([
    __1.type.date,
    __1.io.all
], PushNotificationModel.prototype, "sendAt", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all
], PushNotificationModel.prototype, "sendToTags", void 0);
__decorate([
    __1.type.boolean,
    __1.io.toDocument
], PushNotificationModel.prototype, "sent", void 0);
__decorate([
    __1.type.date,
    __1.io.toDocument,
    __1.io.output
], PushNotificationModel.prototype, "sentAt", void 0);
PushNotificationModel = __decorate([
    __1.model('pushnotification')
], PushNotificationModel);
exports.PushNotificationModel = PushNotificationModel;
//# sourceMappingURL=push.notification.model.js.map