import { AppModel } from './../app/app.model';
import { Request, Response } from 'express';
import { model, Model, type, io, validate, ObjectId, Deco, mongo } from '../../';
import { DynamicConfigModel } from './dynamicconfig.model';
let debug = require('debug')('app:models:dynamic');


@model('dyn')
export class DynamicDataModel2 extends Model {

  @type.id
  public _id: ObjectId;

  @type.date
  public _createdAt: Date;

  @type.date
  public _updatedAt: Date;

  @type.id
  public _createdBy: ObjectId;

  @type.id
  public _updatedBy: ObjectId;

  @type.model({model: AppModel})
  @io.all
  @validate.required
  @mongo.index({type: 'single'})  
  public appId: ObjectId | null = null;

  @type.model({model: DynamicConfigModel})
  @io.all
  @validate.required
  @mongo.index({type: 'single'})
  public modelId: ObjectId | null = null

  static decoFromRequest(req: Request, res: Response): Deco {
    return res.locals.dynamicDeco;
  }

  decoFromRequest(req: Request, res: Response): Deco {
    return res.locals.dynamicDeco;
  }

}
