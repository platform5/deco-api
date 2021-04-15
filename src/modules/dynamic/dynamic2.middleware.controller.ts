import { PolicyControllerMiddlware } from './../user/policy/policy.middleware.controller';
import { AuthMiddleware } from './../user/auth.middleware';
import { AppModel } from './../app/app.model';
import { DynamicConfigModel } from './dynamicconfig.model';
import { DynamicDataModel2 } from './dynamicdata2.model';
import { Request, Response, NextFunction } from 'express';
import { RelatedModelFilterQueryConfig, StringTMap, Policies } from '../../';
import { Deco, TypeDecorator, type, ObjectId, Query, Model, MultipartMiddleware, UpdateQuery, StringStringMap } from '../../';
import { NotificationEmailService, TemplateOverride } from '../../';
import moment from 'moment';
let debug = require('debug')('app:middleware:controllers:dynamic2');

const collectionName = DynamicDataModel2.deco.collectionName;

const propertyTypes = Object.assign({}, DynamicDataModel2.deco.propertyTypes);
const propertyTypesOptions = Object.assign({}, DynamicDataModel2.deco.propertyTypesOptions);

const propertyInputs = JSON.parse(JSON.stringify(DynamicDataModel2.deco.propertyInputs));
const propertyOutputs = JSON.parse(JSON.stringify(DynamicDataModel2.deco.propertyOutputs));
const propertyToDocuments = JSON.parse(JSON.stringify(DynamicDataModel2.deco.propertyToDocuments));

const propertyValidations = Object.assign({}, DynamicDataModel2.deco.propertyValidations);

const propertySearchables = JSON.parse(JSON.stringify(DynamicDataModel2.deco.propertySearchables));
const propertySortables = JSON.parse(JSON.stringify(DynamicDataModel2.deco.propertySortables));
const propertyFilterables = JSON.parse(JSON.stringify(DynamicDataModel2.deco.propertyFilterables));
const propertyFilterablesOptions = Object.assign({}, DynamicDataModel2.deco.propertyFilterablesOptions);

export let dynamicModelDecorator = new TypeDecorator('dynamicmodel');
dynamicModelDecorator.input = type.modelDecorator.input;
dynamicModelDecorator.output = type.modelDecorator.output;
dynamicModelDecorator.validate = (value: any, obj: any, options: any) => {
  if (value === undefined || value === null) return true;

  // todo: make sure the user has the right to create this relation
  let modelId: ObjectId;

  try {
    modelId = new ObjectId(options.model);
  } catch (e) {
    return false;
  }
  
  let configQuery: any = {
    _id: modelId,
    $or: [
      {appId: {$in: [options.appId, options.relatedToAppId]}},
      {relatedToAppId: {$in: [options.appId, options.relatedToAppId]}}
    ]
  };

  let configModel: DynamicConfigModel;
  return DynamicConfigModel.getOneWithQuery(configQuery).then((cm): Promise<any> | boolean => {
    if (!cm) return false;
    configModel = cm;
    if (!configModel.appId || !configModel.relatedToAppId) throw new Error('Invalid configModel');
    return Promise.all([
      AppModel.getOneWithId(configModel.appId),
      AppModel.getOneWithId(configModel.relatedToAppId)
    ]);
  }).then((values) => {
    let deco: Deco = Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, values[0], values[1]);
    return DynamicDataModel2.getOneWithQuery({appId: options.relatedToAppId, modelId: modelId, _id: value}, {deco: deco});
  }).then((data) => {
    if (!data) return false;
    return true;
  });
};
dynamicModelDecorator.decorator();

export let dynamicModelsDecorator = new TypeDecorator('dynamicmodels');
dynamicModelsDecorator.input = type.modelsDecorator.input;
dynamicModelsDecorator.output = type.modelsDecorator.output;
dynamicModelsDecorator.toDocument = (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => {
  if (value === null || value === undefined) return Promise.resolve();
  updateQuery.set(key, value);
  return Promise.resolve();
};
dynamicModelsDecorator.validate = (value: any, obj: any, options: any) => {
  if (value === undefined || value === []) return true;
  if (!Array.isArray(value)) return false;
  let uniqueValue: Array<ObjectId> = [];
    let uniqueValueString: Array<string> = [];
    for (let v of value) {
      if (uniqueValueString.indexOf(v.toString()) === -1) {
        uniqueValue.push(v);
        uniqueValueString.push(v.toString());
      }
    }
  
  // todo: make sure the user has the right to create this relation
  let modelId: ObjectId;

  try {
    modelId = new ObjectId(options.model);
  } catch (e) {
    return false;
  }
  
  let configQuery: any = {
    _id: modelId,
    $or: [
      {appId: {$in: [options.appId, options.relatedToAppId]}},
      {relatedToAppId: {$in: [options.appId, options.relatedToAppId]}}
    ]
  };

  let configModel: DynamicConfigModel;
  return DynamicConfigModel.getOneWithQuery(configQuery).then((cm): Promise<any> | boolean => {
    if (!cm) return false;
    configModel = cm;
    if (!configModel.appId || !configModel.relatedToAppId) throw new Error('Invalid configModel');
    return Promise.all([
      AppModel.getOneWithId(configModel.appId),
      AppModel.getOneWithId(configModel.relatedToAppId)
    ]);
  }).then((values) => {
    let deco: Deco = Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, values[0], values[1]);
    return DynamicDataModel2.getAll(new Query({appId: options.relatedToAppId, modelId: modelId, _id: {$in: uniqueValue}}), {deco: deco});
  }).then((elements: Array<any>) => {
    if (elements.length === uniqueValue.length) return true;
    return false;
  });
};
dynamicModelsDecorator.decorator();


/*
// fetch the model relations
  return options.model.getAll(new Query({_id: {$in: value}})).then((elements: Array<Model>) => {
    if (elements.length === value.length) return true;
    return false;
  });
*/

export class Dynamic2MiddlwareController extends PolicyControllerMiddlware {
  
  static getAllRoute(): string { return '/:slug/'; }
  static getOneRoute(): string { return '/:slug/:elementId'; }
  static postRoute(): string { return '/:slug/'; }
  static putRoute(): string { return '/:slug/:elementId'; }
  static deleteRoute(): string { return '/:slug/:elementId'; }

  static placeDynamicConfigInRequestWithSlug(slug: string) { 
    return (req: Request, res: Response, next: NextFunction) => {
      let configModel: DynamicConfigModel;
      let modelApp: AppModel;

      let query: any = {
        slug: slug
      };
      query.$or = [
        /*{appId: res.locals.app._id},*/ // this is only usefull if we want to be able to manage data from SWISSDATA CLIENT
        {relatedToAppId: res.locals.app._id}
      ];

      DynamicConfigModel.getOneWithQuery(query).then((cm):any => {
        if (!cm) return next(new Error('Invalid Slug'));
        configModel = (cm as DynamicConfigModel);
        if (!configModel.relatedToAppId) return next(new Error('Missing relatedToAppId in DynamicConfig'));
        return AppModel.getOneWithId(configModel.relatedToAppId);
      }).then((a) => {
        if (!a) return next(new Error('Invalid dynamic model app'));
        modelApp = (a as AppModel);
        if (!req.body) req.body = {};
        req.body.modelId = configModel._id;
        req.body.appId = modelApp._id;
        res.locals.dynamicConfigModel = configModel;
        res.locals.dynamicModelApp = modelApp;

        let deco: Deco = Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, res.locals.app, res.locals.dynamicModelApp);

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
        }

        if (configModel.policy && Object.keys(configModel.policy)) {
          res.locals.dynamicControllerPolicy = configModel.policy;
        }

        if (configModel.isPublic) {
          res.locals.dynamicControllerAccess.isPublic = true;
        }

        if (configModel.readingAccess === 'creator') {
          res.locals.dynamicControllerAccess.readByCreator = true;
        } else if (configModel.readingAccess === 'users') {
          res.locals.dynamicControllerAccess.readByUsersArray = true;
        } else if (configModel.readingAccess === 'usersWithRoles') {
          res.locals.dynamicControllerAccess.readByUsersRoles = true;
          res.locals.dynamicControllerAccess.readUsersRoles = configModel.readingRoles;
        }

        if (configModel.writingAccess === 'creator') {
          res.locals.dynamicControllerAccess.writeByCreator = true;
        } else if (configModel.writingAccess === 'users') {
          res.locals.dynamicControllerAccess.writeByUsersArray = true;
        } else if (configModel.writingAccess === 'usersWithRoles') {
          res.locals.dynamicControllerAccess.writeByUsersRoles = true;
          res.locals.dynamicControllerAccess.writeUsersRoles = configModel.readingRoles;
        }

        next();
      });
    }
  }

  static placeDynamicConfigInRequest(req: Request, res: Response, next: NextFunction) {
    let slug = req.params.slug;
    return Dynamic2MiddlwareController.placeDynamicConfigInRequestWithSlug(slug)(req, res, next);
  }

  static getDecoFromConfigModel(configModel: DynamicConfigModel, parentApp: AppModel | ObjectId, appModel: AppModel): Deco {

    let parentAppId: ObjectId;
    if (parentApp instanceof AppModel) {
      parentAppId = parentApp._id
    } else if (parentApp instanceof ObjectId) {
      parentAppId = parentApp;
    } else {
      throw new Error('Invalid parentApp param');
    }

    let deco: Deco = {
      collectionName: collectionName + '_' + appModel._id.toString(),
      modelName: configModel.slug,
      db: DynamicDataModel2.deco.db,
      options: Object.assign({}, DynamicDataModel2.deco.options),
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
        deco.propertyTypes[field.name] = dynamicModelDecorator;
        field.options.appId = parentAppId;
        field.options.relatedToAppId = appModel._id;
      } else if (field.type === 'models') {
        deco.propertyTypes[field.name] = dynamicModelsDecorator;
        field.options.appId = parentAppId;
        field.options.relatedToAppId = appModel._id;
      } else {
        let typeDecoratorKey: string = `${field.type}Decorator`;
        deco.propertyTypes[field.name] = (type as any)[typeDecoratorKey] || type.anyDecorator;
      }
      deco.propertyTypesOptions[field.name] = field.options;
      deco.propertyValidations[field.name] = [];

      if (field.required) {
        deco.propertyValidations[field.name].push({type: 'required', options: {}});
      }

      if (field.filterable !== 'no') {
        deco.propertyFilterables.push((field.name));
        if (field.type === 'model' && field.filterable === 'auto') {
          deco.propertyFilterablesOptions[field.name] = {type: 'ids'};
        } else {
          deco.propertyFilterablesOptions[field.name] = {type: field.filterable};
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

  static getDecoFromSlug(appId: ObjectId, slug: string): Promise<Deco> {
    let configModel: DynamicConfigModel;
    let deco: Deco;
    let relatedApp: AppModel;
    return DynamicConfigModel.getOneWithQuery({relatedToAppId: appId, slug: slug}).then((c) => {
      if (!c) throw new Error('Model Config not found');
      configModel = c;
      if (!configModel.relatedToAppId) throw new Error('Invalid app');
      return AppModel.getOneWithId(configModel.relatedToAppId);
    }).then((a) => {
      if (!a) throw new Error ('Missing relatedApp');
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
  static authenticateAndErrorOnlyIfNotPublic(req: Request, res: Response, next: NextFunction) {
    if (res.locals.dynamicControllerAccess.isPublic) return AuthMiddleware.authenticateWithoutError(req, res, next);
    return AuthMiddleware.authenticate(req, res, next);
  }

  getModelDeco(req: Request, res: Response) {
    return res.locals.dynamicDeco;
  }

  getPolicy(req: Request, res: Response): Policies.Policy {
    return res.locals.dynamicControllerPolicy;
  }

  extendGetAllQuery(query: Query, req: Request, res: Response): Promise<void> {
    return super.extendGetAllQuery(query, req, res).then(() => {
      query.addQuery({modelId: (res.locals.dynamicConfigModel as DynamicConfigModel)._id});
      return Promise.resolve();
    });
  }

  static multipartWrapper(req: Request, res: Response, next: NextFunction): any {
    if (!res.locals.dynamicConfigModel) {
      return next(new Error('Missing dynamicConfigModel in response (did you forget to call placeDynamicConfigInRequest ?)'));
    }

    let mdws = MultipartMiddleware.parseDeco(res.locals.dynamicDeco);

    return mdws[0](req, res, (err: string) => {
      if (err) return next(err);
      return mdws[1](req, res, (err: string) => {
        if (err) return next(err);
        return mdws[2](req, res, (err: string) => {
          if (err) return next(err);
          req.body.modelId = res.locals.dynamicConfigModel._id;
          next();
        });
      });
    });

  }

  postAfterInsert(element: Model, req: Request, res: Response): Promise<Model> {
    let config: DynamicConfigModel = res.locals.dynamicConfigModel;
    if (!config.enableAdminNotification && !config.enableUserNotification) {
      return Promise.resolve(element);
    }

    if (config.notifyWhen.indexOf('create') === -1) {
      return Promise.resolve(element);
    }

    return this.prepareModelNotification(res, element);
  }

  putAfterUpdate(element: Model, req: Request, res: Response): Promise<Model> {
    let config: DynamicConfigModel = res.locals.dynamicConfigModel;
    if (!config.enableAdminNotification && !config.enableUserNotification) {
      return Promise.resolve(element);
    }

    if (config.notifyWhen.indexOf('update') === -1) {
      return Promise.resolve(element);
    }

    return this.prepareModelNotification(res, element);
  }

  deleteAfterDelete(result: any, req: Request, res: Response): Promise<any> {
    let config: DynamicConfigModel = res.locals.dynamicConfigModel;
    if (!config.enableAdminNotification && !config.enableUserNotification) {
      return Promise.resolve(result);
    }

    if (config.notifyWhen.indexOf('delete') === -1) {
      return Promise.resolve(result);
    }

    return Promise.resolve(result);
  }

  findOriginalModelRelations(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>): Promise<Array<RelatedModelFilterQueryConfig>> {
    let relatedModelsConfigs: StringTMap<DynamicConfigModel> = {};
    let config = (res.locals.dynamicConfigModel as DynamicConfigModel);
    return super.findOriginalModelRelations(req, res, relatedQueriesSettings).then(() => {
      let relatedModelsIds: Array<ObjectId> = [];
      for (let field of config.fields) {
        let modelId: ObjectId;
        try {
          modelId = new ObjectId(field.options.model);
        } catch (error) {
          continue;
        }
        relatedModelsIds.push(modelId);
      }

      let query = new Query();
      query.addQuery({appId: res.locals.dynamicConfigModel.appId});
      query.addQuery({_id: {$in: relatedModelsIds}});
      return DynamicConfigModel.getAll(query);
    }).then((configs) => {
      for (let config of configs) {
        relatedModelsConfigs[config._id.toString()] = (config as DynamicConfigModel);
      }
      for (let field of config.fields) {
        if (field.type !== 'model' && field.type !== 'models') continue;
        if (!field.options || !field.options.model) continue;
        let baseQuery = new Query({appId: res.locals.dynamicModelApp._id});
        let modelId: ObjectId;
        try {
          modelId = new ObjectId(field.options.model);
        } catch (error) {
          continue;
        }
        baseQuery.addQuery({modelId: modelId});
        let modelConfig = relatedModelsConfigs[field.options.model];
        let deco: Deco = Dynamic2MiddlwareController.getDecoFromConfigModel(modelConfig, res.locals.app, res.locals.dynamicModelApp);
        relatedQueriesSettings.push({
          model: DynamicDataModel2,
          deco: deco,
          queryKey: field.name,
          queriedModelKey: 'subKey',
          queriedModelIdKey: '_id',
          finalReqKey: field.name,
          direction: 'detected',
          baseQuery: baseQuery,
          multiple: field.type === 'models'
        })
      }
      return relatedQueriesSettings;
    });
  }

  findDetectedModelRelations(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>): Promise<Array<RelatedModelFilterQueryConfig>> {
    return super.findDetectedModelRelations(req, res, relatedQueriesSettings).then(() => {
      let query = new Query();
      query.addQuery({appId: res.locals.dynamicConfigModel.appId});
      query.addQuery({
        //"fields.options.model": res.locals.dynamicConfigModel._id.toString()
        fields: {
          $elemMatch: {
            "type": {$in: ['model', 'models']},
            "options.model": res.locals.dynamicConfigModel._id.toString()
          }
        }
      });
      return DynamicConfigModel.getAll(query);
    }).then((configs) => {
      for (let config of (configs) as Array<DynamicConfigModel>) {
        for (let field of config.fields) {
          if (field.type !== 'model' && field.type !== 'models') continue;
          if (!field.options || !field.options.model || field.options.model !== res.locals.dynamicConfigModel._id.toString()) continue;
          let baseQuery = new Query({appId: res.locals.dynamicModelApp._id});
          baseQuery.addQuery({modelId: config._id});
          let deco: Deco = Dynamic2MiddlwareController.getDecoFromConfigModel(config, res.locals.app, res.locals.dynamicModelApp);
          relatedQueriesSettings.push({
            model: DynamicDataModel2,
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

  prepareModelNotification(res: Response, element: Model) {
    let config: DynamicConfigModel = res.locals.dynamicConfigModel;
    let keyValues: StringStringMap = {};
    let promises: Array<Promise<any>> = [];
    keyValues.id = element._id.toString();
    for (let property in element.deco.propertyTypes) {
      if (property && property.substr(0, 1) === '_') continue;
      if (property === 'appId') continue;
      if (property === 'modelId') continue;
      let type: TypeDecorator = element.deco.propertyTypes[property];
      let options: any = element.deco.propertyTypesOptions[property];
      let value = (element as any)[property];
      if (!value) continue;
      keyValues['_'+property] = value;
      keyValues[property] = '';
      promises.push(type.toString(property, value, options, this, element).then((str) => {
        keyValues[property] = str;
      }));
    }

    return Promise.all(promises).then(() => {
      let sendingPromises: Array<Promise<any>> = [];
      if (config.enableAdminNotification) {
        let email = config.notificationAdminEmail;
        let subject = config.notificationAdminSubject;
        let prefix = config.notificationAdminContentPrefix;
        let suffix = config.notificationAdminContentSuffix;
        let templatePath = 'model-notification';
        let templateOverride: TemplateOverride | null = config.notificationAdminTemplate ? {html: config.notificationAdminTemplate, subject: config.notificationAdminSubject} : null;
        let sendAdminEmailPromise = this.sendNotification(res.locals.app, email, subject, element, keyValues, prefix, suffix, templatePath, templateOverride).then(() => {
          return Promise.resolve(element);
        });
        sendingPromises.push(sendAdminEmailPromise);
      }

      if (config.enableUserNotification) {
        let emailProperty = config.notificationUserField;
        if ((element as any)[emailProperty]) {
          let email = (element as any)[emailProperty]
          let subject = config.notificationUserSubject;
          let prefix = config.notificationUserContentPrefix;
          let suffix = config.notificationUserContentSuffix;
          let templatePath = 'model-notification';
          let templateOverride: TemplateOverride | null = config.notificationUserTemplate ? {html:config.notificationUserTemplate, subject: config.notificationUserSubject} : null;
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

  sendNotification(app: AppModel, email: string, subject: string, element: Model, keyValues: StringStringMap, contentPrefix: string, contentSuffix: string, template: string = 'model-notification', templateOverride: TemplateOverride | null) {
    let emailService = NotificationEmailService.serviceForApp(app);

    return emailService.send(email, template, {
      app: app,
      element: element,
      keyValues: keyValues,
      subject: subject,
      date: moment().format('DD.MM.YYYY'),
      contentPrefix: contentPrefix,
      contentSuffix: contentSuffix
    }, templateOverride).then((response: any) => {
      if (!response) throw new Error('Failed to send validation notification');
      return true;
    });
  }

}
