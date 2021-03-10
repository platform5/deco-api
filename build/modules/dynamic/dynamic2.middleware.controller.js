"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dynamic2MiddlwareController = exports.dynamicModelsDecorator = exports.dynamicModelDecorator = void 0;
const policy_middleware_controller_1 = require("./../user/policy/policy.middleware.controller");
const auth_middleware_1 = require("./../user/auth.middleware");
const app_model_1 = require("./../app/app.model");
const dynamicconfig_model_1 = require("./dynamicconfig.model");
const dynamicdata2_model_1 = require("./dynamicdata2.model");
const __1 = require("../../");
const __2 = require("../../");
const moment_1 = __importDefault(require("moment"));
let debug = require('debug')('app:middleware:controllers:dynamic2');
const collectionName = dynamicdata2_model_1.DynamicDataModel2.deco.collectionName;
const propertyTypes = Object.assign({}, dynamicdata2_model_1.DynamicDataModel2.deco.propertyTypes);
const propertyTypesOptions = Object.assign({}, dynamicdata2_model_1.DynamicDataModel2.deco.propertyTypesOptions);
const propertyInputs = JSON.parse(JSON.stringify(dynamicdata2_model_1.DynamicDataModel2.deco.propertyInputs));
const propertyOutputs = JSON.parse(JSON.stringify(dynamicdata2_model_1.DynamicDataModel2.deco.propertyOutputs));
const propertyToDocuments = JSON.parse(JSON.stringify(dynamicdata2_model_1.DynamicDataModel2.deco.propertyToDocuments));
const propertyValidations = Object.assign({}, dynamicdata2_model_1.DynamicDataModel2.deco.propertyValidations);
const propertySearchables = JSON.parse(JSON.stringify(dynamicdata2_model_1.DynamicDataModel2.deco.propertySearchables));
const propertySortables = JSON.parse(JSON.stringify(dynamicdata2_model_1.DynamicDataModel2.deco.propertySortables));
const propertyFilterables = JSON.parse(JSON.stringify(dynamicdata2_model_1.DynamicDataModel2.deco.propertyFilterables));
const propertyFilterablesOptions = Object.assign({}, dynamicdata2_model_1.DynamicDataModel2.deco.propertyFilterablesOptions);
exports.dynamicModelDecorator = new __1.TypeDecorator('dynamicmodel');
exports.dynamicModelDecorator.input = __1.type.modelDecorator.input;
exports.dynamicModelDecorator.output = __1.type.modelDecorator.output;
exports.dynamicModelDecorator.validate = (value, obj, options) => {
    if (value === undefined || value === null)
        return true;
    // todo: make sure the user has the right to create this relation
    let modelId;
    try {
        modelId = new __1.ObjectId(options.model);
    }
    catch (e) {
        return false;
    }
    let configQuery = {
        _id: modelId,
        $or: [
            { appId: { $in: [options.appId, options.relatedToAppId] } },
            { relatedToAppId: { $in: [options.appId, options.relatedToAppId] } }
        ]
    };
    let configModel;
    return dynamicconfig_model_1.DynamicConfigModel.getOneWithQuery(configQuery).then((cm) => {
        if (!cm)
            return false;
        configModel = cm;
        if (!configModel.appId || !configModel.relatedToAppId)
            throw new Error('Invalid configModel');
        return Promise.all([
            app_model_1.AppModel.getOneWithId(configModel.appId),
            app_model_1.AppModel.getOneWithId(configModel.relatedToAppId)
        ]);
    }).then((values) => {
        let deco = Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, values[0], values[1]);
        return dynamicdata2_model_1.DynamicDataModel2.getOneWithQuery({ appId: options.relatedToAppId, modelId: modelId, _id: value }, { deco: deco });
    }).then((data) => {
        if (!data)
            return false;
        return true;
    });
};
exports.dynamicModelDecorator.decorator();
exports.dynamicModelsDecorator = new __1.TypeDecorator('dynamicmodels');
exports.dynamicModelsDecorator.input = __1.type.modelsDecorator.input;
exports.dynamicModelsDecorator.output = __1.type.modelsDecorator.output;
exports.dynamicModelsDecorator.toDocument = (updateQuery, key, value, operation, options, element, target) => {
    if (value === null || value === undefined)
        return Promise.resolve();
    updateQuery.set(key, value);
    return Promise.resolve();
};
exports.dynamicModelsDecorator.validate = (value, obj, options) => {
    if (value === undefined || value === [])
        return true;
    if (!Array.isArray(value))
        return false;
    let uniqueValue = [];
    let uniqueValueString = [];
    for (let v of value) {
        if (uniqueValueString.indexOf(v.toString()) === -1) {
            uniqueValue.push(v);
            uniqueValueString.push(v.toString());
        }
    }
    // todo: make sure the user has the right to create this relation
    let modelId;
    try {
        modelId = new __1.ObjectId(options.model);
    }
    catch (e) {
        return false;
    }
    let configQuery = {
        _id: modelId,
        $or: [
            { appId: { $in: [options.appId, options.relatedToAppId] } },
            { relatedToAppId: { $in: [options.appId, options.relatedToAppId] } }
        ]
    };
    let configModel;
    return dynamicconfig_model_1.DynamicConfigModel.getOneWithQuery(configQuery).then((cm) => {
        if (!cm)
            return false;
        configModel = cm;
        if (!configModel.appId || !configModel.relatedToAppId)
            throw new Error('Invalid configModel');
        return Promise.all([
            app_model_1.AppModel.getOneWithId(configModel.appId),
            app_model_1.AppModel.getOneWithId(configModel.relatedToAppId)
        ]);
    }).then((values) => {
        let deco = Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, values[0], values[1]);
        return dynamicdata2_model_1.DynamicDataModel2.getAll(new __1.Query({ appId: options.relatedToAppId, modelId: modelId, _id: { $in: uniqueValue } }), { deco: deco });
    }).then((elements) => {
        if (elements.length === uniqueValue.length)
            return true;
        return false;
    });
};
exports.dynamicModelsDecorator.decorator();
/*
// fetch the model relations
  return options.model.getAll(new Query({_id: {$in: value}})).then((elements: Array<Model>) => {
    if (elements.length === value.length) return true;
    return false;
  });
*/
class Dynamic2MiddlwareController extends policy_middleware_controller_1.PolicyControllerMiddlware {
    static getAllRoute() { return '/:slug/'; }
    static getOneRoute() { return '/:slug/:elementId'; }
    static postRoute() { return '/:slug/'; }
    static putRoute() { return '/:slug/:elementId'; }
    static deleteRoute() { return '/:slug/:elementId'; }
    static placeDynamicConfigInRequestWithSlug(slug) {
        return (req, res, next) => {
            let configModel;
            let modelApp;
            let query = {
                slug: slug
            };
            query.$or = [
                /*{appId: res.locals.app._id},*/ // this is only usefull if we want to be able to manage data from SWISSDATA CLIENT
                { relatedToAppId: res.locals.app._id }
            ];
            dynamicconfig_model_1.DynamicConfigModel.getOneWithQuery(query).then((cm) => {
                if (!cm)
                    return next(new Error('Invalid Slug'));
                configModel = cm;
                if (!configModel.relatedToAppId)
                    return next(new Error('Missing relatedToAppId in DynamicConfig'));
                return app_model_1.AppModel.getOneWithId(configModel.relatedToAppId);
            }).then((a) => {
                if (!a)
                    return next(new Error('Invalid dynamic model app'));
                modelApp = a;
                if (!req.body)
                    req.body = {};
                req.body.modelId = configModel._id;
                req.body.appId = modelApp._id;
                res.locals.dynamicConfigModel = configModel;
                res.locals.dynamicModelApp = modelApp;
                let deco = Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, res.locals.app, res.locals.dynamicModelApp);
                res.locals.dynamicDeco = deco;
                res.locals.dynamicControllerAccess = {
                    isPublic: false,
                    readByCreator: false,
                    readByUsersArray: false,
                    readByUsersRoles: false,
                    readUsersRoles: [],
                    writeByCreator: false,
                    writeByUsersArray: false,
                    writeByUsersRoles: false,
                    writeUsersRoles: [],
                };
                if (configModel.policy && Object.keys(configModel.policy)) {
                    res.locals.dynamicControllerPolicy = configModel.policy;
                }
                if (configModel.isPublic) {
                    res.locals.dynamicControllerAccess.isPublic = true;
                }
                if (configModel.readingAccess === 'creator') {
                    res.locals.dynamicControllerAccess.readByCreator = true;
                }
                else if (configModel.readingAccess === 'users') {
                    res.locals.dynamicControllerAccess.readByUsersArray = true;
                }
                else if (configModel.readingAccess === 'usersWithRoles') {
                    res.locals.dynamicControllerAccess.readByUsersRoles = true;
                    res.locals.dynamicControllerAccess.readUsersRoles = configModel.readingRoles;
                }
                if (configModel.writingAccess === 'creator') {
                    res.locals.dynamicControllerAccess.writeByCreator = true;
                }
                else if (configModel.writingAccess === 'users') {
                    res.locals.dynamicControllerAccess.writeByUsersArray = true;
                }
                else if (configModel.writingAccess === 'usersWithRoles') {
                    res.locals.dynamicControllerAccess.writeByUsersRoles = true;
                    res.locals.dynamicControllerAccess.writeUsersRoles = configModel.readingRoles;
                }
                next();
            });
        };
    }
    static placeDynamicConfigInRequest(req, res, next) {
        let slug = req.params.slug;
        return Dynamic2MiddlwareController.placeDynamicConfigInRequestWithSlug(slug)(req, res, next);
    }
    static getDecoFromConfigModel(configModel, parentApp, appModel) {
        let parentAppId;
        if (parentApp instanceof app_model_1.AppModel) {
            parentAppId = parentApp._id;
        }
        else if (parentApp instanceof __1.ObjectId) {
            parentAppId = parentApp;
        }
        else {
            throw new Error('Invalid parentApp param');
        }
        let deco = {
            collectionName: collectionName + '_' + appModel._id.toString(),
            modelName: configModel.slug,
            db: dynamicdata2_model_1.DynamicDataModel2.deco.db,
            options: Object.assign({}, dynamicdata2_model_1.DynamicDataModel2.deco.options),
            propertyTypes: Object.assign({}, propertyTypes),
            propertyTypesOptions: Object.assign({}, propertyTypesOptions),
            propertyInputs: JSON.parse(JSON.stringify(propertyInputs)),
            propertyOutputs: JSON.parse(JSON.stringify(propertyOutputs)),
            propertyToDocuments: JSON.parse(JSON.stringify(propertyToDocuments)),
            propertyValidations: Object.assign({}, propertyValidations),
            propertySearchables: JSON.parse(JSON.stringify(propertySearchables)),
            propertySortables: JSON.parse(JSON.stringify(propertySortables)),
            propertyFilterables: JSON.parse(JSON.stringify(propertyFilterables)),
            propertyFilterablesOptions: Object.assign({}, propertyFilterablesOptions)
        };
        for (let index in configModel.fields) {
            let field = configModel.fields[index];
            deco.propertyInputs.push(field.name);
            deco.propertyOutputs.push(field.name);
            deco.propertyToDocuments.push(field.name);
            if (field.type === 'string' && field.options.multilang) {
                field.options.locales = appModel.locales;
            }
            if (field.type === 'model') {
                deco.propertyTypes[field.name] = exports.dynamicModelDecorator;
                field.options.appId = parentAppId;
                field.options.relatedToAppId = appModel._id;
            }
            else if (field.type === 'models') {
                deco.propertyTypes[field.name] = exports.dynamicModelsDecorator;
                field.options.appId = parentAppId;
                field.options.relatedToAppId = appModel._id;
            }
            else {
                let typeDecoratorKey = `${field.type}Decorator`;
                deco.propertyTypes[field.name] = __1.type[typeDecoratorKey] || __1.type.anyDecorator;
            }
            deco.propertyTypesOptions[field.name] = field.options;
            deco.propertyValidations[field.name] = [];
            if (field.required) {
                deco.propertyValidations[field.name].push({ type: 'required', options: {} });
            }
            if (field.filterable !== 'no') {
                deco.propertyFilterables.push((field.name));
                if (field.type === 'model' && field.filterable === 'auto') {
                    deco.propertyFilterablesOptions[field.name] = { type: 'ids' };
                }
                else {
                    deco.propertyFilterablesOptions[field.name] = { type: field.filterable };
                }
            }
            if (field.searchable) {
                deco.propertySearchables.push(field.name);
            }
            if (field.sortable) {
                deco.propertySortables.push(field.name);
            }
        }
        return deco;
    }
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
            deco = Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, appId, relatedApp);
            return deco;
        });
    }
    /*
      static authenticateIfNotPublic(req: Request, res: Response, next: NextFunction) {
        if (res.locals.dynamicControllerAccess.isPublic) return next();
        return AuthMiddleware.authenticate(req, res, next);
      }
    */
    static authenticateAndErrorOnlyIfNotPublic(req, res, next) {
        if (res.locals.dynamicControllerAccess.isPublic)
            return auth_middleware_1.AuthMiddleware.authenticateWithoutError(req, res, next);
        return auth_middleware_1.AuthMiddleware.authenticate(req, res, next);
    }
    getModelDeco(req, res) {
        return res.locals.dynamicDeco;
    }
    getPolicy(req, res) {
        return res.locals.dynamicControllerPolicy;
    }
    extendGetAllQuery(query, req, res) {
        return super.extendGetAllQuery(query, req, res).then(() => {
            query.addQuery({ modelId: res.locals.dynamicConfigModel._id });
            return Promise.resolve();
        });
    }
    static multipartWrapper(req, res, next) {
        if (!res.locals.dynamicConfigModel) {
            return next(new Error('Missing dynamicConfigModel in response (did you forget to call placeDynamicConfigInRequest ?)'));
        }
        let mdws = __1.MultipartMiddleware.parseDeco(res.locals.dynamicDeco);
        return mdws[0](req, res, (err) => {
            if (err)
                return next(err);
            return mdws[1](req, res, (err) => {
                if (err)
                    return next(err);
                return mdws[2](req, res, (err) => {
                    if (err)
                        return next(err);
                    req.body.modelId = res.locals.dynamicConfigModel._id;
                    next();
                });
            });
        });
    }
    postAfterInsert(element, req, res) {
        let config = res.locals.dynamicConfigModel;
        if (!config.enableAdminNotification && !config.enableUserNotification) {
            return Promise.resolve(element);
        }
        if (config.notifyWhen.indexOf('create') === -1) {
            return Promise.resolve(element);
        }
        return this.prepareModelNotification(res, element);
    }
    putAfterUpdate(element, req, res) {
        let config = res.locals.dynamicConfigModel;
        if (!config.enableAdminNotification && !config.enableUserNotification) {
            return Promise.resolve(element);
        }
        if (config.notifyWhen.indexOf('update') === -1) {
            return Promise.resolve(element);
        }
        return this.prepareModelNotification(res, element);
    }
    deleteAfterDelete(result, req, res) {
        let config = res.locals.dynamicConfigModel;
        if (!config.enableAdminNotification && !config.enableUserNotification) {
            return Promise.resolve(result);
        }
        if (config.notifyWhen.indexOf('delete') === -1) {
            return Promise.resolve(result);
        }
        return Promise.resolve(result);
    }
    findOriginalModelRelations(req, res, relatedQueriesSettings) {
        let relatedModelsConfigs = {};
        let config = res.locals.dynamicConfigModel;
        return super.findOriginalModelRelations(req, res, relatedQueriesSettings).then(() => {
            let relatedModelsIds = [];
            for (let field of config.fields) {
                let modelId;
                try {
                    modelId = new __1.ObjectId(field.options.model);
                }
                catch (error) {
                    continue;
                }
                relatedModelsIds.push(modelId);
            }
            let query = new __1.Query();
            query.addQuery({ appId: res.locals.dynamicConfigModel.appId });
            query.addQuery({ _id: { $in: relatedModelsIds } });
            return dynamicconfig_model_1.DynamicConfigModel.getAll(query);
        }).then((configs) => {
            for (let config of configs) {
                relatedModelsConfigs[config._id.toString()] = config;
            }
            for (let field of config.fields) {
                if (field.type !== 'model' && field.type !== 'models')
                    continue;
                if (!field.options || !field.options.model)
                    continue;
                let baseQuery = new __1.Query({ appId: res.locals.dynamicModelApp._id });
                let modelId;
                try {
                    modelId = new __1.ObjectId(field.options.model);
                }
                catch (error) {
                    continue;
                }
                baseQuery.addQuery({ modelId: modelId });
                let modelConfig = relatedModelsConfigs[field.options.model];
                let deco = Dynamic2MiddlwareController.getDecoFromConfigModel(modelConfig, res.locals.app, res.locals.dynamicModelApp);
                relatedQueriesSettings.push({
                    model: dynamicdata2_model_1.DynamicDataModel2,
                    deco: deco,
                    queryKey: field.name,
                    queriedModelKey: 'subKey',
                    queriedModelIdKey: '_id',
                    finalReqKey: field.name,
                    direction: 'detected',
                    baseQuery: baseQuery,
                    multiple: field.type === 'models'
                });
            }
            return relatedQueriesSettings;
        });
    }
    findDetectedModelRelations(req, res, relatedQueriesSettings) {
        return super.findDetectedModelRelations(req, res, relatedQueriesSettings).then(() => {
            let query = new __1.Query();
            query.addQuery({ appId: res.locals.dynamicConfigModel.appId });
            query.addQuery({
                //"fields.options.model": res.locals.dynamicConfigModel._id.toString()
                fields: {
                    $elemMatch: {
                        "type": { $in: ['model', 'models'] },
                        "options.model": res.locals.dynamicConfigModel._id.toString()
                    }
                }
            });
            return dynamicconfig_model_1.DynamicConfigModel.getAll(query);
        }).then((configs) => {
            for (let config of (configs)) {
                for (let field of config.fields) {
                    if (field.type !== 'model' && field.type !== 'models')
                        continue;
                    if (!field.options || !field.options.model || field.options.model !== res.locals.dynamicConfigModel._id.toString())
                        continue;
                    let baseQuery = new __1.Query({ appId: res.locals.dynamicModelApp._id });
                    baseQuery.addQuery({ modelId: config._id });
                    let deco = Dynamic2MiddlwareController.getDecoFromConfigModel(config, res.locals.app, res.locals.dynamicModelApp);
                    relatedQueriesSettings.push({
                        model: dynamicdata2_model_1.DynamicDataModel2,
                        deco: deco,
                        queryKey: config.slug,
                        queriedModelKey: 'subKey',
                        queriedModelIdKey: field.name,
                        finalReqKey: 'id',
                        direction: 'detected',
                        baseQuery: baseQuery,
                        multiple: field.type === 'models'
                    });
                }
            }
            return relatedQueriesSettings;
        });
    }
    prepareModelNotification(res, element) {
        let config = res.locals.dynamicConfigModel;
        let keyValues = {};
        let promises = [];
        keyValues.id = element._id.toString();
        for (let property in element.deco.propertyTypes) {
            if (property && property.substr(0, 1) === '_')
                continue;
            if (property === 'appId')
                continue;
            if (property === 'modelId')
                continue;
            let type = element.deco.propertyTypes[property];
            let options = element.deco.propertyTypesOptions[property];
            let value = element[property];
            if (!value)
                continue;
            keyValues['_' + property] = value;
            keyValues[property] = '';
            promises.push(type.toString(property, value, options, this, element).then((str) => {
                keyValues[property] = str;
            }));
        }
        return Promise.all(promises).then(() => {
            let sendingPromises = [];
            if (config.enableAdminNotification) {
                let email = config.notificationAdminEmail;
                let subject = config.notificationAdminSubject;
                let prefix = config.notificationAdminContentPrefix;
                let suffix = config.notificationAdminContentSuffix;
                let templatePath = 'model-notification';
                let templateOverride = config.notificationAdminTemplate ? { html: config.notificationAdminTemplate, subject: config.notificationAdminSubject } : null;
                let sendAdminEmailPromise = this.sendNotification(res.locals.app, email, subject, element, keyValues, prefix, suffix, templatePath, templateOverride).then(() => {
                    return Promise.resolve(element);
                });
                sendingPromises.push(sendAdminEmailPromise);
            }
            if (config.enableUserNotification) {
                let emailProperty = config.notificationUserField;
                if (element[emailProperty]) {
                    let email = element[emailProperty];
                    let subject = config.notificationUserSubject;
                    let prefix = config.notificationUserContentPrefix;
                    let suffix = config.notificationUserContentSuffix;
                    let templatePath = 'model-notification';
                    let templateOverride = config.notificationUserTemplate ? { html: config.notificationUserTemplate, subject: config.notificationUserSubject } : null;
                    let sendAdminEmailPromise = this.sendNotification(res.locals.app, email, subject, element, keyValues, prefix, suffix, templatePath, templateOverride).then(() => {
                        return Promise.resolve(element);
                    });
                    sendingPromises.push(sendAdminEmailPromise);
                }
            }
            return Promise.all(sendingPromises).then(() => {
                return Promise.resolve(element);
            });
        });
    }
    sendNotification(app, email, subject, element, keyValues, contentPrefix, contentSuffix, template = 'model-notification', templateOverride) {
        let emailService = __2.NotificationEmailService.serviceForApp(app);
        return emailService.send(email, template, {
            app: app,
            element: element,
            keyValues: keyValues,
            subject: subject,
            date: moment_1.default().format('DD.MM.YYYY'),
            contentPrefix: contentPrefix,
            contentSuffix: contentSuffix
        }, templateOverride).then((response) => {
            if (!response)
                throw new Error('Failed to send validation notification');
            return true;
        });
    }
}
exports.Dynamic2MiddlwareController = Dynamic2MiddlwareController;
//# sourceMappingURL=dynamic2.middleware.controller.js.map