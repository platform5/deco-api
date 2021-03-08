import { UserModel } from './../user/user.model';
import { model, Model, type, io, validate, ObjectId } from '../../';
let debug = require('debug')('app:models:dico');

@model('test_decorators')
export class TestDecoratorsModel extends Model {

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

  @type.select({options: ['blue', 'red', 'yellow'], multiple: true})
  @io.all
  colors?: Array<string> = [];

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

  @type.increment({min: 10})
  @io.all
  orderNb?: number;

  @type.object({keys: {
    name: {type: 'string'},
    value: {type: 'integer'}
  }})
  @io.all
  data?: any;

  @type.object({keys: {
    name: {type: 'string'},
    value: {type: 'integer'}
  }, allowOtherKeys: true})
  @io.all
  data2?: any;
}