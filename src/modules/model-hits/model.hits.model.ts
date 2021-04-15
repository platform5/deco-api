import { UserModel } from './../user/user.model';
import { AppModel } from './../app/app.model';
import { model, Model, type, io, query, validate, ObjectId  } from '../../';
import { Request, Response } from 'express';
import moment from 'moment';
let debug = require('debug')('app:models:models.hits.model');

export class Hit {
  method: 'get' | 'post' | 'put' | 'delete';
  date: Date;
}

@model('modelhits')
export class ModelHitsModel extends Model {
  @type.model({model: AppModel})
  @io.toDocument
  @query.filterable({type: 'auto'})
  @validate.required
  public appId: ObjectId | null = null;

  @type.model({model: UserModel})
  @io.toDocument
  @query.filterable({type: 'auto'})
  @validate.required
  public userId: ObjectId | null = null;

  @type.string
  @io.toDocument
  @validate.required
  modelId: string = '';

  @type.any
  @io.toDocument
  @validate.required
  elementId: ObjectId;

  @type.boolean
  @io.toDocument
  singleHit: boolean = true;

  @type.string
  @io.toDocument
  @validate.required
  ip: string = '';

  @type.array({type: 'object', options: {
    keys: {
      method: {type: 'select', options: ['get', 'post', 'put', 'delete'], required: true},
      date: {type: 'date', required: true}
    }
  }})
  @io.toDocument
  @validate.required
  hits: Array<Hit> = [];

  static singleHit(req: Request, res: Response, modelId: string, elementId?: string) {
    if (!res || !res.locals || !res.locals.app) throw new Error('Missing app in res.locals');
    let appId = res.locals.app._id;
    let userId = (res.locals.user) ? res.locals.user._id : undefined;
    let elId = ModelHitsModel.elementIdFromRequest(req, res, elementId);
    if (!req.ip) throw new Error('Missing IP');
    let ip = req.ip;
    let method = req.method;
    let date = moment().toDate();


    let findQuery = {
      appId: appId,
      userId: userId,
      modelId: modelId,
      elementId: elId,
      ip: ip,
      singleHit: true,
      "hits.date": {$gte: moment().startOf('day').toDate()}
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

    return ModelHitsModel.deco.db.collection(ModelHitsModel.deco.collectionName).update(findQuery, upsertQuery, {upsert: true});

  }

  static singleStats(req: Request, res: Response, modelId: string, elementId?: string) {
    if (!res || !res.locals || !res.locals.app) throw new Error('Missing app in res.locals');
    let appId = res.locals.app._id;
    let elId = ModelHitsModel.elementIdFromRequest(req, res, elementId);
    let findQuery = {appId: appId, modelId: modelId, elementId: elId};
    return ModelHitsModel.deco.db.collection(ModelHitsModel.deco.collectionName).find(findQuery).count();
  }


  static elementIdFromRequest(req: Request, res: Response, elementId?: string): ObjectId {
    if (!elementId) {
      if (req.params.elementId) elementId = req.params.elementId;
      else if (res.locals.element && res.locals.element._id) elementId = res.locals.element._id.toString();
      else if (res.locals.element && res.locals.element.id) elementId = res.locals.element.id;
      if (!elementId) throw new Error('Missing elementId');
    }

    let response: ObjectId;
    try {
      response = new ObjectId(elementId);
    } catch(error) {
      throw new Error('Invalid elementId');
    }

    return response;
  }
}