import { UserModel } from './../user/user.model';
import { AppModel } from './../app/app.model';
import { model, Model, type, io, query, validate, ObjectId } from '../../';
let debug = require('debug')('app:models:dico');

@model('data')
export class DataModel extends Model {

  @type.model({model: AppModel})
  @io.input
  @io.toDocument
  @query.filterable({type: 'auto'})
  @validate.required
  public appId: ObjectId | null = null;

  @type.string
  @validate.required
  @io.all
  title: string = '';
  
  @type.integer({min: 0, max: 10})
  @io.all
  value: number = 0;

  @type.float({min: 0, max: 10})
  @io.all
  measure?: string;

  @type.select({options: ['profile', 'account']})
  @io.all
  type: string = 'profile';

  @type.array({type: 'string'})
  @io.all
  tags?: Array<string>;

  @type.date({dateFormat: 'DD.MM.YYYY'})
  @io.all
  date?: Date;

  @type.file({accepted: ['image/*', 'application/pdf']})
  @io.all
  public image: any = null;

  @type.files({accepted: ['image/*', 'application/pdf']})
  @io.all
  public documents: Array<any> = [];

  @type.boolean
  @io.all
  active: boolean = false;

  @type.model({model: UserModel})
  @io.all
  user?: ObjectId;
}