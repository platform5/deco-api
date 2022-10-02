"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PushPlayerModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushPlayerModel = void 0;
const user_model_1 = require("./../user/user.model");
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
let debug = require('debug')('app:models:dico');
let PushPlayerModel = PushPlayerModel_1 = class PushPlayerModel extends __1.Model {
    constructor() {
        super();
        this.userId = null;
        this.tags = [];
        this.active = true;
        this.model = PushPlayerModel_1;
    }
    static nbPlayers(appId) {
        return Promise.all([
            PushPlayerModel_1.deco.db.collection(PushPlayerModel_1.deco.collectionName).find({ appId: appId, active: true }).count(),
            PushPlayerModel_1.deco.db.collection(PushPlayerModel_1.deco.collectionName).find({ appId: appId, active: false }).count()
        ]).then((values) => {
            return {
                nb: values[0],
                inactive: values[1]
            };
        });
    }
    static tags(appId) {
        return PushPlayerModel_1.deco.db.collection(PushPlayerModel_1.deco.collectionName).aggregate([
            { $match: { appId: appId, active: true } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } }
        ]).toArray().then((result) => {
            let tags = {};
            for (let r of result) {
                tags[r._id] = r.count;
            }
            return tags;
        });
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.all,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], PushPlayerModel.prototype, "appId", void 0);
__decorate([
    __1.type.model({ model: user_model_1.UserModel }),
    __1.io.all,
    __1.query.filterable({ type: 'auto' }),
    __1.mongo.index({ type: 'single' })
], PushPlayerModel.prototype, "userId", void 0);
__decorate([
    __1.type.string,
    __1.io.input,
    __1.io.toDocument,
    __1.mongo.index({ type: 'single' })
], PushPlayerModel.prototype, "regId", void 0);
__decorate([
    __1.type.string,
    __1.io.input,
    __1.io.toDocument
], PushPlayerModel.prototype, "uuid", void 0);
__decorate([
    __1.type.select({ options: ['fcm', 'apn'] }),
    __1.io.all,
    __1.query.filterable({ type: 'auto' })
], PushPlayerModel.prototype, "type", void 0);
__decorate([
    __1.type.date,
    __1.io.all,
    __1.query.filterable({ type: 'auto' })
], PushPlayerModel.prototype, "lastVisit", void 0);
__decorate([
    __1.type.array({ type: 'string' }),
    __1.io.all,
    __1.query.filterable({ type: 'auto' })
], PushPlayerModel.prototype, "tags", void 0);
__decorate([
    __1.type.boolean,
    __1.io.all
], PushPlayerModel.prototype, "active", void 0);
PushPlayerModel = PushPlayerModel_1 = __decorate([
    __1.model('pushplayer')
], PushPlayerModel);
exports.PushPlayerModel = PushPlayerModel;
//# sourceMappingURL=push.player.model.js.map