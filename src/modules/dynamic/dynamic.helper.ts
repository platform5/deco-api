import { DynamicDataModel2 } from './dynamicdata2.model';
import { Dynamic2MiddlwareController } from './dynamic2.middleware.controller';
import { AppModel } from './../app/app.model';
import { DynamicConfigModel } from './dynamicconfig.model';
import { ObjectId, Query, Deco } from '../../';
let debug = require('debug')('app:helpers:dynamic');

export class DynamicHelper {

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
  
  static getElementInstance(app: AppModel, slug: string, id: string | ObjectId): Promise<DynamicDataModel2> {
    let configModel: DynamicConfigModel;
    let modelId: ObjectId;
    let deco: Deco;
    let relatedApp: AppModel;
    if (id instanceof ObjectId) {
      modelId = id;
    } else {
      try {
        modelId = new ObjectId(id);
      } catch (e) {
        throw new Error('Invalid modelId');
      }
    }
    return DynamicConfigModel.getOneWithQuery({relatedToAppId: app._id, slug: slug}).then((c) => {
      if (!c) throw new Error('Element config not found');
      configModel = c;
      if (!configModel.relatedToAppId) throw new Error('Invalid app');
      return AppModel.getOneWithId(configModel.relatedToAppId);
    }).then((a) => {
      if (!a) throw new Error ('Missing relatedApp');
      relatedApp = a;
      deco = Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, app, relatedApp);
      return DynamicDataModel2.getOneWithId(modelId, {deco: deco});
    }).then((e) => {
      if (!e) throw new Error('Element not found');
      return e;
    });
  }

  static getElementInstances(app: AppModel, slug: string, query: Query): Promise<Array<DynamicDataModel2>> {
    let configModel: DynamicConfigModel;
    let deco: Deco;
    let relatedApp: AppModel;
    return DynamicConfigModel.getOneWithQuery({relatedToAppId: app._id, slug: slug}).then((c) => {
      if (!c) throw new Error('Element config not found');
      configModel = c;
      if (!configModel.relatedToAppId) throw new Error('Invalid app');
      return AppModel.getOneWithId(configModel.relatedToAppId);
    }).then((a) => {
      if (!a) throw new Error ('Missing relatedApp');
      relatedApp = a;
      query.addQuery({modelId: configModel._id});
      deco = Dynamic2MiddlwareController.getDecoFromConfigModel(configModel, app, relatedApp);
      return DynamicDataModel2.getAll(query, {deco: deco});
    }).then((e) => {
      if (!e) throw new Error('Element not found');
      return e;
    });
  }
}
