import { DynamicConfigModel } from './../dynamic/dynamicconfig.model';
import { ModelHitsModel } from './model.hits.model';
import { Deco } from '../../';
import { Request, Response, NextFunction } from 'express';
let debug = require('debug')('app:middlewares:controllers:model.hits');


export class ModelHitsMiddleware {
  static singleHit(modelId: string | 'dynamic') {
    return (req: Request, res: Response, next: NextFunction) => {
      ModelHitsMiddleware.modelId(modelId, res).then((modelId) => {
        return ModelHitsModel.singleHit(req, res, modelId);
      }).then(() => {
        next();
      }).catch(next);
    }
  }

  static singleStats(modelId: string | 'dynamic') {
    return (req: Request, res: Response, next: NextFunction) => {
      ModelHitsMiddleware.modelId(modelId, res).then((modelId) => {
        return ModelHitsModel.singleStats(req, res, modelId);
      }).then((stats) => {
        res.send({stats: stats});
      }).catch(next);
    }
  }

  private static modelId(modelId: string | 'dynamic', res: Response): Promise<string> {
    if (modelId && modelId !== 'dynamic') return Promise.resolve(modelId);
    if (modelId === 'dynamic') {
      // find modelId in dynamic deco
      let deco: Deco = res.locals.dynamicDeco;
      if (deco && deco.modelId) return Promise.resolve(deco.modelId.toString());
      else {
        return DynamicConfigModel.getOneWithQuery({slug: deco.modelName}).then((config) => {
          if (!config) throw new Error('Model not found');
          return config._id.toHexString();
        });
      }
    }
    throw new Error('Model not found');
  }

}