"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelHitsMiddleware = void 0;
const dynamicconfig_model_1 = require("./../dynamic/dynamicconfig.model");
const model_hits_model_1 = require("./model.hits.model");
let debug = require('debug')('app:middlewares:controllers:model.hits');
class ModelHitsMiddleware {
    static singleHit(modelId) {
        return (req, res, next) => {
            ModelHitsMiddleware.modelId(modelId, res).then((modelId) => {
                return model_hits_model_1.ModelHitsModel.singleHit(req, res, modelId);
            }).then(() => {
                next();
            }).catch(next);
        };
    }
    static singleStats(modelId) {
        return (req, res, next) => {
            ModelHitsMiddleware.modelId(modelId, res).then((modelId) => {
                return model_hits_model_1.ModelHitsModel.singleStats(req, res, modelId);
            }).then((stats) => {
                res.send({ stats: stats });
            }).catch(next);
        };
    }
    static modelId(modelId, res) {
        if (modelId && modelId !== 'dynamic')
            return Promise.resolve(modelId);
        if (modelId === 'dynamic') {
            // find modelId in dynamic deco
            let deco = res.locals.dynamicDeco;
            if (deco && deco.modelId)
                return Promise.resolve(deco.modelId.toString());
            else {
                return dynamicconfig_model_1.DynamicConfigModel.getOneWithQuery({ slug: deco.modelName }).then((config) => {
                    if (!config)
                        throw new Error('Model not found');
                    return config._id.toHexString();
                });
            }
        }
        throw new Error('Model not found');
    }
}
exports.ModelHitsMiddleware = ModelHitsMiddleware;
//# sourceMappingURL=model.hits.controller.js.map