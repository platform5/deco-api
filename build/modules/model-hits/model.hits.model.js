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
var ModelHitsModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("./../user/user.model");
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
const moment_1 = __importDefault(require("moment"));
let debug = require('debug')('app:models:models.hits.model');
class Hit {
}
exports.Hit = Hit;
let ModelHitsModel = ModelHitsModel_1 = class ModelHitsModel extends __1.Model {
    constructor() {
        super(...arguments);
        this.appId = null;
        this.userId = null;
        this.modelId = '';
        this.singleHit = true;
        this.ip = '';
        this.hits = [];
    }
    static singleHit(req, res, modelId, elementId) {
        if (!res || !res.locals || !res.locals.app)
            throw new Error('Missing app in res.locals');
        let appId = res.locals.app._id;
        let userId = (res.locals.user) ? res.locals.user._id : undefined;
        let elId = ModelHitsModel_1.elementIdFromRequest(req, res, elementId);
        if (!req.ip)
            throw new Error('Missing IP');
        let ip = req.ip;
        let method = req.method;
        let date = moment_1.default().toDate();
        let findQuery = {
            appId: appId,
            userId: userId,
            modelId: modelId,
            elementId: elId,
            ip: ip,
            singleHit: true,
            "hits.date": { $gte: moment_1.default().startOf('day').toDate() }
        };
        let upsertQuery = {
            $set: {
                appId: appId,
                userId: userId,
                modelId: modelId,
                elementId: elId,
                ip: ip,
                singleHit: true
            },
            $push: {
                "hits": {
                    method: method,
                    date: date
                }
            }
        };
        return ModelHitsModel_1.deco.db.collection(ModelHitsModel_1.deco.collectionName).update(findQuery, upsertQuery, { upsert: true });
    }
    static singleStats(req, res, modelId, elementId) {
        if (!res || !res.locals || !res.locals.app)
            throw new Error('Missing app in res.locals');
        let appId = res.locals.app._id;
        let elId = ModelHitsModel_1.elementIdFromRequest(req, res, elementId);
        let findQuery = { appId: appId, modelId: modelId, elementId: elId };
        return ModelHitsModel_1.deco.db.collection(ModelHitsModel_1.deco.collectionName).find(findQuery).count();
    }
    static elementIdFromRequest(req, res, elementId) {
        if (!elementId) {
            if (req.params.elementId)
                elementId = req.params.elementId;
            else if (res.locals.element && res.locals.element._id)
                elementId = res.locals.element._id.toString();
            else if (res.locals.element && res.locals.element.id)
                elementId = res.locals.element.id;
            if (!elementId)
                throw new Error('Missing elementId');
        }
        let response;
        try {
            response = new __1.ObjectId(elementId);
        }
        catch (error) {
            throw new Error('Invalid elementId');
        }
        return response;
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.toDocument,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required
], ModelHitsModel.prototype, "appId", void 0);
__decorate([
    __1.type.model({ model: user_model_1.UserModel }),
    __1.io.toDocument,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required
], ModelHitsModel.prototype, "userId", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.validate.required
], ModelHitsModel.prototype, "modelId", void 0);
__decorate([
    __1.type.any,
    __1.io.toDocument,
    __1.validate.required
], ModelHitsModel.prototype, "elementId", void 0);
__decorate([
    __1.type.boolean,
    __1.io.toDocument
], ModelHitsModel.prototype, "singleHit", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.validate.required
], ModelHitsModel.prototype, "ip", void 0);
__decorate([
    __1.type.array({ type: 'object', options: {
            keys: {
                method: { type: 'select', options: ['get', 'post', 'put', 'delete'], required: true },
                date: { type: 'date', required: true }
            }
        } }),
    __1.io.toDocument,
    __1.validate.required
], ModelHitsModel.prototype, "hits", void 0);
ModelHitsModel = ModelHitsModel_1 = __decorate([
    __1.model('modelhits')
], ModelHitsModel);
exports.ModelHitsModel = ModelHitsModel;
//# sourceMappingURL=model.hits.model.js.map