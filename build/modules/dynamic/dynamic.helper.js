"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamicdata2_model_1 = require("./dynamicdata2.model");
const dynamic2_middleware_controller_1 = require("./dynamic2.middleware.controller");
const app_model_1 = require("./../app/app.model");
const dynamicconfig_model_1 = require("./dynamicconfig.model");
const __1 = require("../../");
let debug = require('debug')('app:helpers:dynamic');
class DynamicHelper {
    static getDecoFromSlug(appId, slug) {
        let configModel;
        let deco;
        let relatedApp;
        return dynamicconfig_model_1.DynamicConfigModel.getOneWithQuery({ relatedToAppId: appId, slug: slug }).then((c) => {
            if (!c)
                throw new Error('Model Config not found');
            configModel = c;
            if (!configModel.relatedToAppId)
                throw new Error('Invalid app');
            return app_model_1.AppModel.getOneWithId(configModel.relatedToAppId);
        }).then((a) => {
            if (!a)
                throw new Error('Missing relatedApp');
            relatedApp = a;
            deco = dynamic2_middleware_controller_1.Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, appId, relatedApp);
            return deco;
        });
    }
    static getElementInstance(app, slug, id) {
        let configModel;
        let modelId;
        let deco;
        let relatedApp;
        if (id instanceof __1.ObjectId) {
            modelId = id;
        }
        else {
            try {
                modelId = new __1.ObjectId(id);
            }
            catch (e) {
                throw new Error('Invalid modelId');
            }
        }
        return dynamicconfig_model_1.DynamicConfigModel.getOneWithQuery({ relatedToAppId: app._id, slug: slug }).then((c) => {
            if (!c)
                throw new Error('Element config not found');
            configModel = c;
            if (!configModel.relatedToAppId)
                throw new Error('Invalid app');
            return app_model_1.AppModel.getOneWithId(configModel.relatedToAppId);
        }).then((a) => {
            if (!a)
                throw new Error('Missing relatedApp');
            relatedApp = a;
            deco = dynamic2_middleware_controller_1.Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, app, relatedApp);
            return dynamicdata2_model_1.DynamicDataModel2.getOneWithId(modelId, { deco: deco });
        }).then((e) => {
            if (!e)
                throw new Error('Element not found');
            return e;
        });
    }
    static getElementInstances(app, slug, query) {
        let configModel;
        let deco;
        let relatedApp;
        return dynamicconfig_model_1.DynamicConfigModel.getOneWithQuery({ relatedToAppId: app._id, slug: slug }).then((c) => {
            if (!c)
                throw new Error('Element config not found');
            configModel = c;
            if (!configModel.relatedToAppId)
                throw new Error('Invalid app');
            return app_model_1.AppModel.getOneWithId(configModel.relatedToAppId);
        }).then((a) => {
            if (!a)
                throw new Error('Missing relatedApp');
            relatedApp = a;
            query.addQuery({ modelId: configModel._id });
            deco = dynamic2_middleware_controller_1.Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, app, relatedApp);
            return dynamicdata2_model_1.DynamicDataModel2.getAll(query, { deco: deco });
        }).then((e) => {
            if (!e)
                throw new Error('Element not found');
            return e;
        });
    }
}
exports.DynamicHelper = DynamicHelper;
//# sourceMappingURL=dynamic.helper.js.map